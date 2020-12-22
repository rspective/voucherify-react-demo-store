export const setCartItemsPayload = (item) => {
	return {
		product_id: item.id,
		quantity: item.count,
		price: item.price,
		amount: item.total,
	};
};

export const setValidatePayload = (
	currentCustomer,
	total,
	cartItems,
	paymentMethod
) => {
	return {
		customer: {
			id: currentCustomer.id,
		},
		amount: total,
		items: cartItems.map(setCartItemsPayload),
		metadata: {
			card: paymentMethod,
		},
	};
};

export const setRedemptionPayload = (
	currentCustomer,
	totalAmount,
	items,
	paymentMethod
) => {
	return {
		customer: {
			id: currentCustomer.id,
		},
		order: {
			amount: totalAmount,
			items: items.map(setCartItemsPayload),
		},
		metadata: {
			card: paymentMethod,
		},
	};
};

export const setOrderPayload = (
	currentCustomer,
	totalAmount,
	items,
	paymentMethod
) => {
	return {
		customer: {
			id: currentCustomer.id,
		},
		amount: totalAmount,
		items: items.map(setCartItemsPayload),
		metadata: {
			card: paymentMethod,
		},
	};
};

export const sendPayload = async (payload, payloadType) => {
	let routeUrl;
	if (payloadType === 'redeem') {
		routeUrl = '/redemptions/redeem';
	} else {
		routeUrl = '/orders/create';
	}
	const res = await fetch(`${process.env.REACT_APP_API_URL || ''}${routeUrl}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(payload),
	});
	const sendPayload = await res.json();
	return sendPayload;
};

export const getOrderId = () => {
	return 'hot_beans_' + Math.random().toString(36).substr(2, 20);
};
