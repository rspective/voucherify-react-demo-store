import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Product from '../Products/Product';
import Cart from '../Cart';
import PageSuccess from '../Page/PageSuccess';
import PageError from '../Page/PageError';
import Products from '../Products';
import AppWebhookWrapper from './AppWebhookWrapper';

const AppRoutes = () => {
	return (
		<>
			<AppWebhookWrapper />
			<Switch>
				<Route exact path="/" component={Products} />
				<Route path="/details/:productId" component={Product} />
				<Route path="/cart" component={Cart} />
				<Route path="/success" component={PageSuccess} />
				<Route component={PageError} />
			</Switch>
		</>
	);
};

export default AppRoutes;
