import React, { useState, useEffect } from 'react';
import SidebarPersonalDiscounts from './SidebarPersonalDiscounts';
import SidebarPublicDiscounts from './SidebarPublicDiscounts';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SidebarCartDiscounts from './SidebarCartDiscounts';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import IconButton from '@material-ui/core/IconButton';
import './style.css';
import { connect } from 'react-redux';
import { setEnableSidebar } from '../../redux/actions/userActions';
import VoucherifyLogoSquare from '../../assets/VoucherifyLogoSquare.png';
import Tooltip from '@material-ui/core/Tooltip';
import LaunchIcon from '@material-ui/icons/Launch';
import GitHubIcon from '@material-ui/icons/GitHub';
import PropTypes from 'prop-types';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import SidebarRewards from './SidebarRewards';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import SidebarGiftCards from './SidebarGiftCards';
import LoyaltyIcon from '@material-ui/icons/Loyalty';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import SidebarReferral from './SidebarReferral';
import SidebarLoyalty from './SidebarLoyalty';

const TabPanel = (props) => {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`vertical-tabpanel-${index}`}
			aria-labelledby={`vertical-tab-${index}`}
			className="sidebarTab"
			{...other}
		>
			{value === index && <>{children}</>}
		</div>
	);
};

TabPanel.propTypes = {
	children: PropTypes.object,
	value: PropTypes.number,
	index: PropTypes.number,
};

const Sidebar = ({ enableSidebar, dispatch }) => {
	const [toggle, setToggle] = useState(enableSidebar);
	const [value, setValue] = useState(1);

	const handleToggleSidebar = () => {
		setToggle(!toggle);
	};

	useEffect(() => {
		dispatch(setEnableSidebar(toggle));
	}, [dispatch, toggle]);

	const a11yProps = (index) => {
		if (index === value) {
			return {
				id: `vertical-tab-${index}`,
				'aria-controls': `vertical-tabpanel-${index}`,
				className: 'currentTab',
			};
		} else {
			return {
				id: `vertical-tab-${index}`,
				'aria-controls': `vertical-tabpanel-${index}`,
			};
		}
	};

	const handleChange = (event, newValue) => {
		if (newValue === 0) {
			handleToggleSidebar();
		} else if (enableSidebar === false) {
			handleToggleSidebar();
			setValue(newValue);
		} else {
			setValue(newValue);
		}
	};

	return (
		<div className="sidebarWrapper">
			<div className="sidebarContentWrapper">
				<Tabs
					TabIndicatorProps={{
						style: {
							right: 'unset',
							width: '4px',
							backgroundColor: 'var(--orange)',
						},
					}}
					orientation="vertical"
					value={value}
					onChange={handleChange}
					aria-label="Control panel"
					className="sidebarLabels"
				>
					<Tooltip title="Close sidebar">
						<Tab
							className="voucherifyIcon"
							icon={<img src={VoucherifyLogoSquare} width="24px" alt="" />}
							{...a11yProps(0)}
						/>
					</Tooltip>
					<Tooltip title="Check personal discounts">
						<Tab icon={<PersonIcon />} {...a11yProps(1)} />
					</Tooltip>
					<Tooltip title="Check rewards">
						<Tab icon={<FavoriteBorderIcon />} {...a11yProps(2)} />
					</Tooltip>
					<Tooltip title="Check public discounts">
						<Tab icon={<GroupIcon />} {...a11yProps(3)} />
					</Tooltip>
					<Tooltip title="Check cart discounts">
						<Tab icon={<ShoppingCartIcon />} {...a11yProps(4)} />
					</Tooltip>
					<Tooltip title="Check gift cards">
						<Tab icon={<CardGiftcardIcon />} {...a11yProps(5)} />
					</Tooltip>
					<Tooltip title="Check Referral Campaigns">
						<Tab icon={<GroupAddIcon />} {...a11yProps(6)} />
					</Tooltip>
					<Tooltip title="Check Loyalty Campaigns">
						<Tab icon={<LoyaltyIcon />} {...a11yProps(7)} />
					</Tooltip>
					<div className="tabLinks tabIcon">
						<Tooltip title="Check documentation">
							<a href="https://github.com/voucherifyio/voucherify-showcase-store">
								<IconButton>
									<GitHubIcon />
								</IconButton>
							</a>
						</Tooltip>
					</div>
					<div className="tabIcon">
						<Tooltip title="Deploy">
							<a href="https://dashboard.heroku.com/new?button-url=https%3A%2F%2Fgithub.com%2F&template=https%3A%2F%2Fgithub.com%2Fvoucherifyio%2Fvoucherify-showcase-store%2F">
								<IconButton>
									<LaunchIcon />
								</IconButton>
							</a>
						</Tooltip>
					</div>
				</Tabs>
				<TabPanel value={value} index={1}>
					<SidebarPersonalDiscounts />
				</TabPanel>
				<TabPanel value={value} index={2}>
					<SidebarRewards />
				</TabPanel>
				<TabPanel value={value} index={3}>
					<SidebarPublicDiscounts />
				</TabPanel>
				<TabPanel value={value} index={4}>
					<SidebarCartDiscounts />
				</TabPanel>
				<TabPanel value={value} index={5}>
					<SidebarGiftCards />
				</TabPanel>
				<TabPanel value={value} index={6}>
					<SidebarReferral />
				</TabPanel>
				<TabPanel value={value} index={7}>
					<SidebarLoyalty />
				</TabPanel>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		enableSidebar: state.userReducer.enableSidebar,
	};
};

export default connect(mapStateToProps)(Sidebar);

Sidebar.propTypes = {
	enableSidebar: PropTypes.bool,
	dispatch: PropTypes.func,
};
