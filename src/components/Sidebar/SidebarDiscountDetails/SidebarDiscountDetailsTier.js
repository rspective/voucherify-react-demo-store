import React from 'react';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import PropTypes from 'prop-types';
import { isEmpty } from '../../../redux/utils';

const SidebarDiscountDetailsTier = ({ tier, index }) => {
  let discountTierText = '';
  let discountTierProduct = '';

  if (tier.action.discount.type === 'PERCENT') {
    discountTierText = `${tier.action.discount.percent_off}%`;
  } else if (tier.action.discount.type === 'AMOUNT') {
    discountTierText = `$${(tier.action.discount.amount_off / 100).toFixed(2)}`;
  }

  if (!isEmpty(tier.metadata.promotion_product)) {
    discountTierProduct = ` for ${tier.metadata.promotion_product}`;
  }

  return (
    <div key={tier.name} className="redemptionTier">
      <p className="redemptionRules tierTitle">Tier {index + 1}</p>
      <div>
        <p className="discountDescription">
          Discount{' '}
          <span className="discountDescriptionAmount">{discountTierText}</span>
          {discountTierProduct}
        </p>
      </div>
      <div>
        <p className="redemptionRules">Redemption rules</p>
        <div className="redemptionRulesWrapper"></div>
        {tier.metadata.redemption_steps.split(';').map((step) => (
          <div key={step} className="redemptionRulesStep">
            <ArrowRightIcon />
            <div>{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarDiscountDetailsTier;

SidebarDiscountDetailsTier.propTypes = {
  tier: PropTypes.object.isRequired,
  index: PropTypes.number,
};
