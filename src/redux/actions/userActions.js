import { loadState } from '../localStorage';
import _map from 'lodash.map';
import _get from 'lodash.get';
import _isEmpty from 'lodash.isempty';
import { setValidatePayload } from '../../utils';
import {
	START_USER_SESSION_REQUEST,
	START_USER_SESSION_SUCCESS,
	START_USER_SESSION_ERROR,
	GET_CUSTOMERS_REQUEST,
	GET_CUSTOMERS_SUCCESS,
	GET_CUSTOMERS_ERROR,
	GET_QUALIFICATIONS_REQUEST,
	GET_QUALIFICATIONS_SUCCESS,
	GET_QUALIFICATIONS_ERROR,
	GET_CAMPAIGNS_REQUEST,
	GET_CAMPAIGNS_SUCCESS,
	GET_CAMPAIGNS_ERROR,
	GET_VOUCHERS_REQUEST,
	GET_VOUCHERS_SUCCESS,
	GET_VOUCHERS_ERROR,
	GET_CURRENT_CUSTOMER_REQUEST,
	GET_CURRENT_CUSTOMER_SUCCESS,
	GET_CURRENT_CUSTOMER_ERROR,
	SET_ENABLE_CART_DISCOUNTS,
	REMOVE_CURRENT_CUSTOMER,
	ENABLE_SIDEBAR,
	SET_CURRENT_CART_DISCOUNT,
	ADD_PUBLISHED_CODES,
	IS_OLD_APP_VERSION,
	SET_CURRENT_APP_VERSION,
	ADD_NEW_CUSTOMERS_SUCCESS,
	UPDATE_GIFT_CARD_BALANCE,
	SET_API_CALL,
	SET_API_RESPONSE,
} from '../constants';

export const setApiCall = (title, apiCall) => {
	return { type: SET_API_CALL, payload: { title, apiCall } };
};

export const setApiResponse = (title, apiResponse) => {
	return { type: SET_API_RESPONSE, payload: { title, apiResponse } };
};

export const isOldAppVersion = () => {
	return { type: IS_OLD_APP_VERSION };
};

export const setCurrentAppVersion = (appVersion) => {
	return { type: SET_CURRENT_APP_VERSION, payload: { appVersion } };
};

export const startUserSessionRequest = () => {
	return { type: START_USER_SESSION_REQUEST };
};

export const updateGiftCardBalance = (
	campaignName,
	giftCardCode,
	giftCardBalanceAfterRedemption
) => {
	return {
		type: UPDATE_GIFT_CARD_BALANCE,
		payload: { campaignName, giftCardCode, giftCardBalanceAfterRedemption },
	};
};

export const startUserSessionSuccess = ({ sessionId, publishedCodes }) => {
	return {
		type: START_USER_SESSION_SUCCESS,
		payload: { sessionId, publishedCodes },
	};
};

export const newCustomersSuccess = ({ publishedCodes }) => {
	return {
		type: ADD_NEW_CUSTOMERS_SUCCESS,
		payload: { publishedCodes },
	};
};

export const startUserSessionError = () => {
	return { type: START_USER_SESSION_ERROR };
};

export const getCustomersRequest = () => {
	return { type: GET_CUSTOMERS_REQUEST };
};
export const getCustomersSuccess = ({ customers }) => {
	return { type: GET_CUSTOMERS_SUCCESS, payload: { customers } };
};

export const getCustomersError = () => {
	return { type: GET_CUSTOMERS_ERROR };
};

export const setEnableSidebar = (enableSidebar) => {
	return { type: ENABLE_SIDEBAR, payload: { enableSidebar } };
};

export const getQualificationsRequest = () => {
	return { type: GET_QUALIFICATIONS_REQUEST };
};
export const getQualificationsSuccess = (qualifications) => {
	return { type: GET_QUALIFICATIONS_SUCCESS, payload: { qualifications } };
};

export const setEnableCartDiscounts = (enableCartDiscounts) => {
	return { type: SET_ENABLE_CART_DISCOUNTS, payload: { enableCartDiscounts } };
};

export const setCurrentCartDiscount = (currentCartDiscount) => {
	return { type: SET_CURRENT_CART_DISCOUNT, payload: { currentCartDiscount } };
};

export const getQualificationsError = () => {
	return { type: GET_QUALIFICATIONS_ERROR };
};

export const getCampaignsRequest = () => {
	return { type: GET_CAMPAIGNS_REQUEST };
};

export const getCampaignsSuccess = (campaigns) => {
	return { type: GET_CAMPAIGNS_SUCCESS, payload: { campaigns } };
};

export const getCampaignsError = () => {
	return { type: GET_CAMPAIGNS_ERROR };
};

export const getVouchersRequest = () => {
	return { type: GET_VOUCHERS_REQUEST };
};

export const getVouchersSuccess = (vouchers) => {
	return { type: GET_VOUCHERS_SUCCESS, payload: { vouchers } };
};

export const addPublishedCodes = (currentCustomer, campaign) => {
	return { type: ADD_PUBLISHED_CODES, payload: { currentCustomer, campaign } };
};

export const getVouchersError = () => {
	return { type: GET_VOUCHERS_ERROR };
};

export const removeCurrentCustomer = () => {
	return { type: REMOVE_CURRENT_CUSTOMER };
};

export const getCurrentCustomerRequest = () => {
	return { type: GET_CURRENT_CUSTOMER_REQUEST };
};

export const getCurrentCustomerSuccess = (currentCustomer) => {
	return { type: GET_CURRENT_CUSTOMER_SUCCESS, payload: { currentCustomer } };
};

export const getCurrentCustomerError = () => {
	return { type: GET_CURRENT_CUSTOMER_ERROR };
};

export const checkVersion = () => async (dispatch) => {
	if (
		loadState() !== undefined &&
		!_isEmpty(loadState().userReducer) &&
		loadState().userReducer.appVersion === null &&
		loadState().userReducer.appVersion !== process.env.REACT_APP_VERSION
	) {
		return dispatch(newSession());
	}
};

export const newSession = () => async (dispatch) => {
	await fetch(`${process.env.REACT_APP_API_URL || ''}/start/newSession`, {
		credentials: 'include',
	});
	await dispatch(isOldAppVersion());
	return dispatch(startUserSession());
};

export const startUserSession = () => async (dispatch) => {
	try {
		dispatch(startUserSessionRequest());
		dispatch(setCurrentAppVersion(process.env.REACT_APP_VERSION));
		const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/start`, {
			credentials: 'include',
		});
		const userSession = await res.json();

		if (
			userSession.coupons.length === 0 &&
			loadState() !== undefined &&
			!_isEmpty(loadState().userReducer.publishedCodes)
		) {
			dispatch(
				startUserSessionSuccess({
					sessionId: userSession.session,
					publishedCodes: loadState().userReducer.publishedCodes,
				})
			);
		} else {
			dispatch(
				startUserSessionSuccess({
					sessionId: userSession.session,
					publishedCodes: userSession.coupons,
				})
			);
		}
		await dispatch(getCustomers());
		await dispatch(getCampaigns());
		await dispatch(getVouchers());
	} catch (error) {
		console.log('[startUserSession][Error]', error);
		dispatch(startUserSessionError());
	}
};

export const newCustomers = () => async (dispatch) => {
	try {
		dispatch(getCustomersRequest());
		const res = await fetch(
			`${process.env.REACT_APP_API_URL || ''}/start/newcustomers`,
			{
				credentials: 'include',
			}
		);

		const nextPublishedCodes = await res.json();

		dispatch(
			newCustomersSuccess({
				publishedCodes: nextPublishedCodes.coupons,
			})
		);

		await dispatch(getCustomers());
		await dispatch(getCampaigns());
		await dispatch(getVouchers());
	} catch (error) {
		console.log('[newCustomers][Error]', error);
		dispatch(startUserSessionError());
	}
};

export const getCustomers = () => async (dispatch, getState) => {
	const { publishedCodes, currentCustomer } = getState().userReducer;
	try {
		dispatch(getCustomersRequest());
		const res = await fetch(
			`${process.env.REACT_APP_API_URL || ''}/customers/all`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					publishedCodes,
				}),
			}
		);
		const customers = await res.json();
		dispatch(getCustomersSuccess({ customers }));
		// Check if customers includes currentCustomer
		// if there is an issue with localStorage or server, remove currentCustomer
		if (
			currentCustomer !== null &&
			!_map(customers, 'id', []).includes(_get(currentCustomer, 'id'))
		) {
			dispatch(removeCurrentCustomer());
		}
	} catch (error) {
		console.log('[getCustomers][Error]', error);
		dispatch(getCustomersError());
	}
};

export const getCampaigns = () => async (dispatch, getState) => {
	const { publishedCodes } = getState().userReducer;
	const { products } = getState().storeReducer;
	try {
		dispatch(getCampaignsRequest());
		const campRes = await fetch(
			`${process.env.REACT_APP_API_URL || ''}/campaigns`,
			{
				credentials: 'include',
			}
		);

		const campaigns = await campRes.json();

		campaigns.forEach(async (camps) => {
			let replacedText;
			for (let index = 0; index < products.length; index++) {
				const element = products[index];
				if (
					!_isEmpty(camps.metadata.description) &&
					camps.metadata.description.includes(element.name)
				) {
					replacedText = camps.metadata.description.replace(
						element.name,
						`<a class='descriptionLink' href='/details/${element.id}'>${element.name}</a>`
					);
					camps.metadata.description = replacedText;
				}
			}

			camps.coupons = [];
			publishedCodes.forEach((code) => {
				code.campaigns.forEach((camp) => {
					if (camp.campaign === camps.name) {
						// Is this coupon a reward?
						if (camp.is_reward) {
							camps.coupons.push({
								customer: code.currentCustomer,
								code: camp.code,
								customerReward: true,
								isNewReward: true,
							});
						} else if (camp.type === 'GIFT_VOUCHER') {
							camps.coupons.push({
								customer: code.currentCustomer,
								code: camp.code,
								giftCardAmount: camp.gift.amount,
								giftCardBalance: camp.gift.amount,
							});
						} else {
							camps.coupons.push({
								customer: code.currentCustomer,
								code: camp.code,
							});
						}
					}
				});
			});

			if (camps.campaign_type === 'PROMOTION') {
				const promotionResponse = await fetch(
					`${process.env.REACT_APP_API_URL || ''}/promotions/${camps.id}`,
					{
						include: 'credentials',
					}
				);

				const campaignPromotions = await promotionResponse.json();

				camps.tiers = campaignPromotions.tiers;
			}
		});
		dispatch(getCampaignsSuccess(campaigns));
	} catch (error) {
		console.log('[getCampaigns][Error]', error);
		dispatch(getCampaignsError());
	}
};

const sleep = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getVouchers = () => async (dispatch) => {
	try {
		dispatch(getVouchersRequest());
		const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/vouchers`, {
			credentials: 'include',
		});
		const vouchers = await res.json();

		dispatch(getVouchersSuccess(vouchers));
	} catch (error) {
		console.log('[getVouchers][Error]', error);
		dispatch(getVouchersError());
	}
};

export const updateCurrentCustomerData = (data) => async (
	dispatch,
	getState
) => {
	const { currentCustomer } = getState().userReducer;
	const id = currentCustomer.id;
	try {
		const res = await fetch(
			`${process.env.REACT_APP_API_URL || ''}/customers/update`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					id,
					...data,
				}),
			}
		);
		const updatedCurrentCustomer = await res.json();
		dispatch(getCurrentCustomer(updatedCurrentCustomer.id));
	} catch (error) {
		console.log('[updateCurrentCustomerData][Error]', error);
	}
};
export const publishCampaign = (campaign) => async (dispatch, getState) => {
	const { currentCustomer } = getState().userReducer;
	try {
		const res = await fetch(
			`${process.env.REACT_APP_API_URL || ''}/distributions/create`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ currentCustomer, campaign }),
			}
		);
		const publishedCampaign = await res.json();
		dispatch(addPublishedCodes(currentCustomer.id, publishedCampaign));
	} catch (error) {
		console.log('[publishCampaign][Error]', error);
	}
};

export const getCurrentCustomer = (id, type = 'normal') => async (
	dispatch,
	getState
) => {
	try {
		dispatch(getCurrentCustomerRequest());
		const res = await fetch(
			`${process.env.REACT_APP_API_URL || ''}/customers/${id}`,
			{
				credentials: 'include',
			}
		);

		const currentCustomer = await res.json();

		if (type === 'normal') {
			dispatch(getCurrentCustomerSuccess(currentCustomer));
		} else {
			const oldSelectedCustomer = getState().userReducer.currentCustomer;

			if (
				oldSelectedCustomer.summary.orders.total_amount ===
				currentCustomer.summary.orders.total_amount
			) {
				// If true -> wait
				await sleep(5000);
				await dispatch(getCurrentCustomer(id, 'update'));
			} else {
				await dispatch(getCurrentCustomer(id));
				await dispatch(getCampaigns());
				await dispatch(getVouchers());
			}
		}
	} catch (error) {
		if (type === 'normal') {
			console.log('[getCurrentCustomer][Error]', error);
		} else {
			console.log('[getCurrentCustomer][Update][Error]', error);
		}
		dispatch(getCurrentCustomerError());
	}
};

export const getQualifications = () => async (dispatch, getState) => {
	const { currentCustomer, paymentMethod } = getState().userReducer;
	const { totalAmount, items } = getState().cartReducer;
	const qualificationsPayload = setValidatePayload(
		currentCustomer,
		totalAmount,
		items,
		paymentMethod
	);
	try {
		dispatch(getQualificationsRequest());

		dispatch(setApiCall('Qualifications', qualificationsPayload));
		const res = await fetch(
			`${process.env.REACT_APP_API_URL || ''}/qualifications`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(qualificationsPayload),
			}
		);
		const qualifications = await res.json();

		dispatch(getQualificationsSuccess(qualifications));
		dispatch(setApiResponse('Qualifications', qualifications));
	} catch (error) {
		console.log('[getQualifications][Error]', error);

		dispatch(getQualificationsError());
	}
};
