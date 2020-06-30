require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const voucherifyClient = require("voucherify");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const redis = require("redis");
const voucherifyData = require("./setup/voucherifyData");
const campaigns = voucherifyData.campaigns;
const versionNumber = voucherifyData.versionNumber;
const SQLiteStore = require("connect-sqlite3")(session);
const RedisStore = require("connect-redis")(session);

if (process.env.NODE_ENV !== "production") {
  app.use(
    session({
      store: new SQLiteStore({ dir: ".data" }),
      secret: "keyboard cat",
      resave: true,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // month
    }),
    cors({
      credentials: true,
      origin: "http://localhost:3001", // REACT_APP_API_URL
    })
  );
} else {
  const redisClient = redis.createClient(process.env.REDIS_URL); //REDIS_URL is provided by Heroku when using Redis Heroku Addon
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: "keyboard cat",
      resave: false,
    })
  );
}
let storeCustomers = require("./src/storeCustomers.json");

const voucherify = voucherifyClient({
  applicationId: process.env.APPLICATION_ID,
  clientSecretKey: process.env.CLIENT_SECRET_KEY,
});

function publishForCustomer(id) {
  const params = {
    customer: {
      source_id: id,
    },
  };
  return campaigns
    .map((campaign) => campaign.name)
    .map((campaign) =>
      voucherify.distributions.publications.create(
        Object.assign(params, { campaign })
      )
    );
}

app.use(bodyParser.json());

app.get("/init", async (request, response) => {
  const createdCouponsList = [];

  if (request.session.views) {
    console.log(`[Re-visit] ${request.session.id} - ${request.session.views}`);
    ++request.session.views;
  } else {
    request.session.views = 1;
    console.log(`[New-visit] ${request.session.id}`);

    //Create new customers if this is a new session
    const createdCustomers = await Promise.all(
      storeCustomers.map(async (customer) => {
        let customerID = `${request.session.id}${customer.metadata.demostore_id}`;
        customer.source_id = customerID;
        let createdCustomer = voucherify.customers.create(customer);

        //We're setting up dummy order for one of the customers
        if (customer.source_id === `${request.session.id}danielwieszcz`) {
          const dummyOrderPayload = {
            source_id: "hot_beans_dummyorder",
            items: [
              {
                quantity: 1,
                price: 30000,
                amount: 30000,
              },
            ],
            amount: 30000,
            customer: {
              source_id: customer.source_id,
            },
            status: "FULFILLED",
          };

          await voucherify.orders.create(dummyOrderPayload);
        }
        return createdCustomer;
      })
    );

    for await (const createdCustomer of createdCustomers) {
      try {
        const customerCoupons = [];
        const createdCoupons = Promise.all(
          publishForCustomer(createdCustomer.source_id)
        ).catch((e) => console.error(`[Publishing coupons][Error] - ${e}`));
        let coupons = await createdCoupons;
        //Assing validation rules for voucher "Customer unique code"
        coupons.forEach((coupon) => {
          if (
            coupon.voucher.metadata.demostoreName === "Customer unique code"
          ) {
            customerCoupons.push(coupon);
          }
        });

        let uniqueCoupon = customerCoupons.find(
          (coupon) => coupon.tracking_id === createdCustomer.source_id
        );
        if (typeof uniqueCoupon !== "undefined") {
          let customerValidationRuleId =
            createdCustomer.metadata.customerValidationRuleId;
          let assignment = { voucher: uniqueCoupon.voucher.code };
          await voucherify.validationRules.createAssignment(
            customerValidationRuleId,
            assignment
          );
        }
        createdCouponsList.push({
          customer: createdCustomer.source_id,
          campaigns: coupons.map((coupon) => coupon.voucher),
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  response.json({
    session: request.session.id,
    coupons: createdCouponsList,
  });
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/customer/:source_id", async (request, response) => {
  let source_id = request.params.source_id;
  try {
    const customer = await voucherify.customers.get(source_id);
    response.json(await customer);
  } catch (e) {
    console.error(`[Fetching customers][Error] - ${e}`);
    response.status(500).end();
  }
});

app.get("/redemptions/:source_id", async (request, response) => {
  let source_id = request.params.source_id;
  try {
    const redemptionLists = await voucherify.redemptions.list({
      customer: source_id,
    });
    response.json(await redemptionLists);
  } catch (e) {
    console.error(`[Fetching redemptions][Error] - ${e}`);
    response.status(500).end();
  }
});

app.get("/vouchers", async (request, response) => {
  try {
    const standaloneVouchersList = await voucherify.vouchers.list({
      category: "STANDALONE",
    });
    const vouchers = standaloneVouchersList.vouchers.filter(
      (voucher) => voucher.metadata.demostoreVersion === versionNumber
    );
    return response.json(vouchers);
  } catch (e) {
    console.error(`[Fetching vouchers][Error] - ${e}`);
    response.status(500).end();
  }
});

app.get("/campaigns", async (request, response) => {
  try {
    const campaignsList = await voucherify.campaigns.list();

    const campaigns = campaignsList.campaigns.filter(
      (campaign) => campaign.metadata.demostoreVersion === versionNumber
    );

    return response.json(campaigns);
  } catch (e) {
    console.error(`[Fetching campaigns][Error] - ${e}`);
    response.status(500).end();
  }
});

app.get("/products", async (request, response) => {
  try {
    const productsList = await voucherify.products.list();

    //Filter out 'Shipping" - default Voucherify product

    const products = productsList.products.filter(
      (product) => product.name !== "Shipping"
    );

    return response.json(products);
  } catch (e) {
    console.error(`[Fetching products][Error] - ${e}`);
    response.status(500).end();
  }
});

app.post("/order", async (request, response) => {
  try {
    const order = await voucherify.orders.create(request.body);
    return response.json(order);
  } catch (e) {
    console.log(e);
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));
  app.get("/*", (request, response) => {
    response.sendFile(path.join(__dirname, "build", "index.html"));
  });
} else {
  app.get("/*", (request, response) => {
    response.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your server is listening on port ${listener.address().port}`);
});
