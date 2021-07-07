const router = require('express').Router();
const voucherifyClient = require('voucherify');
const voucherify = voucherifyClient({
  applicationId: process.env.REACT_APP_BACKEND_APP_ID,
  clientSecretKey: process.env.REACT_APP_BACKEND_KEY,
  apiUrl: Boolean(process.env.REACT_APP_API_ENDPOINT)
		? process.env.REACT_APP_API_ENDPOINT
		: 'https://api.voucherify.io',
});
router.route('*').get(async (req, res) => {
  try {
    const allProducts = await voucherify.products.list();
    // Filter out default Voucherify products
    const products = allProducts.products.filter(
      (product) =>
        product.name !== 'Shipping' &&
        product.name !== 'Watchflix' &&
        product.name !== 'Apple iPhone 8'
    );
    return res.json(products);
  } catch (e) {
    console.error(`[Products][Error] - ${e}`);
    res.status(500).end();
  }
});

module.exports = router;
