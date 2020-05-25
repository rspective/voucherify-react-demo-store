import React, { useState } from "react";
import { ProductConsumer } from "../Context";
import "voucherify.js";

window.Voucherify.initialize(
  "f503ecb0-c840-4748-ad75-a17694014b7f",
  "791c2768-347c-44ee-8e67-00eecd7b89a6"
);

const CartForm = () => {
  const [couponCode, setCouponCode] = useState("");

  return (
    <ProductConsumer>
      {(value) => {
        const { addPromotionToCart } = value;
        return (
          <form className="card p-2">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Promo code"
                onChange={(event) => setCouponCode(event.target.value)}
              />
              <div className="input-group-append">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => addPromotionToCart(couponCode)}
                >
                  Redeem
                </button>
              </div>
            </div>
          </form>
        );
      }}
    </ProductConsumer>
  );
};
export default CartForm;
