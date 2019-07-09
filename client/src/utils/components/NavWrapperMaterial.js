// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {NavLink} from 'react-router-dom';
import Tools from 'src/utils/helpers/Tools';
import {APP} from 'src/constants';

// $FlowFixMe: do not complain about importing node_modules
import clsx from 'clsx';
// $FlowFixMe: do not complain about importing node_modules
import {makeStyles, useTheme} from '@material-ui/core/styles';
// $FlowFixMe: do not complain about importing node_modules
import AccountCircle from '@material-ui/icons/AccountCircle';
// $FlowFixMe: do not complain about importing node_modules
import Drawer from '@material-ui/core/Drawer';
// $FlowFixMe: do not complain about importing node_modules
import Menu from '@material-ui/core/Menu';
// $FlowFixMe: do not complain about importing node_modules
import MenuItem from '@material-ui/core/MenuItem';
// $FlowFixMe: do not complain about importing node_modules
import AppBar from '@material-ui/core/AppBar';
// $FlowFixMe: do not complain about importing node_modules
import Toolbar from '@material-ui/core/Toolbar';
// $FlowFixMe: do not complain about importing node_modules
import List from '@material-ui/core/List';
// $FlowFixMe: do not complain about importing node_modules
import CssBaseline from '@material-ui/core/CssBaseline';
// $FlowFixMe: do not complain about importing node_modules
import Typography from '@material-ui/core/Typography';
// $FlowFixMe: do not complain about importing node_modules
import IconButton from '@material-ui/core/IconButton';
// $FlowFixMe: do not complain about importing node_modules
import MenuIcon from '@material-ui/icons/Menu';
// $FlowFixMe: do not complain about importing node_modules
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
// $FlowFixMe: do not complain about importing node_modules
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
// $FlowFixMe: do not complain about importing node_modules
import ListItem from '@material-ui/core/ListItem';
// $FlowFixMe: do not complain about importing node_modules
import ListItemIcon from '@material-ui/core/ListItemIcon';
// $FlowFixMe: do not complain about importing node_modules
import ListItemText from '@material-ui/core/ListItemText';
// $FlowFixMe: do not complain about importing node_modules
import PersonIcon from '@material-ui/icons/Person';
// $FlowFixMe: do not complain about importing node_modules
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
// $FlowFixMe: do not complain about importing node_modules
import PeopleIcon from '@material-ui/icons/People';
// $FlowFixMe: do not complain about importing node_modules
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
// $FlowFixMe: do not complain about importing node_modules
import ArchiveIcon from '@material-ui/icons/Archive';
// $FlowFixMe: do not complain about importing node_modules
import SettingsIcon from '@material-ui/icons/Settings';
// $FlowFixMe: do not complain about importing node_modules
import MapIcon from '@material-ui/icons/Map';
// $FlowFixMe: do not complain about importing node_modules
import LocationIcon from '@material-ui/icons/LocationOn';
// $FlowFixMe: do not complain about importing node_modules
import CartIcon from '@material-ui/icons/ShoppingBasket';
// $FlowFixMe: do not complain about importing node_modules
import RateIcon from '@material-ui/icons/MonetizationOn';
// $FlowFixMe: do not complain about importing node_modules
import CountCheckIcon from '@material-ui/icons/PlaylistAddCheck';
// $FlowFixMe: do not complain about importing node_modules
import ServiceFeeIcon from '@material-ui/icons/LocalShipping';
// $FlowFixMe: do not complain about importing node_modules
import LogoutIcon from '@material-ui/icons/ExitToApp';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex'
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    menuButton: {
        marginRight: 36
    },
    hide: {
        display: 'none'
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& a': {
            color: 'black',
            textDecoration: 'none'
        }
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1
        }
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar
    },
    title: {
        flexGrow: 1
    },
    content: {
        flexGrow: 1
    },
    list: {
        paddingTop: 0
    }
}));

type Props = {
    history: Object,
    location: Object,
    children: React.Node
};

const App = ({history, location, children}: Props) => {
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openDropdownMenu = Boolean(anchorEl);

    const logout = Tools.logout(history);
    const navigateTo = Tools.navigateTo(history);

    function handleDrawerOpen() {
        setOpen(true);
    }

    function handleDrawerClose() {
        setOpen(false);
    }

    function handleMenu(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    const menuItem = (url: string, title: string, Icon: React.ComponentType<*>) => {
        url = `/${url}`;
        return (
            <NavLink exact={url ? false : true} to={url}>
                <ListItem button key={title} selected={location.pathname === url}>
                    <ListItemIcon>
                        <Icon />
                    </ListItemIcon>
                    <ListItemText primary={title} />
                </ListItem>
            </NavLink>
        );
    };

    const renderMenu = (menu: string) => {
        switch (menu) {
            case 'profile':
                return menuItem('', 'Tài khoản', PersonIcon);
            case 'admin':
                if (APP !== 'admin') return null;
                return menuItem('staff', 'Admin', PersonOutlineIcon);
            case 'customer':
                if (APP !== 'admin') return null;
                return menuItem('customer', 'Khách hàng', PeopleIcon);
            case 'order':
                return menuItem('order', 'Đơn order', ShoppingCartIcon);
            case 'bol':
                return menuItem('bol', 'Vận đơn', ArchiveIcon);
            case 'variable':
                if (APP !== 'admin') return null;
                return menuItem('variable', 'Cấu hình', SettingsIcon);
            case 'area':
                if (APP !== 'admin') return null;
                return menuItem('area', 'Vùng', MapIcon);
            case 'address':
                if (APP !== 'user') return null;
                return menuItem('address', 'Địa chỉ', LocationIcon);
            case 'cart':
                if (APP !== 'user') return null;
                return menuItem('cart', 'Giỏ hàng', CartIcon);
            case 'rate':
                if (APP !== 'admin') return null;
                return menuItem('rate', 'Tỷ giá', RateIcon);
            case 'serviceFee':
                if (APP !== 'admin') return null;
                return menuItem('order-fee', 'Phí dịch vụ', ServiceFeeIcon);
            case 'countCheck':
                if (APP !== 'admin') return null;
                return menuItem('count-check', 'Kiểm đếm', CountCheckIcon);
        }
    };

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open
                })}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="Open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open
                        })}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap className={classes.title}>
                        24H Order
                    </Typography>

                    <div>
                        <IconButton
                            aria-label="Account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit">
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                            open={openDropdownMenu}
                            onClose={handleClose}>
                            <MenuItem onClick={() => navigateTo()}>
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <Typography>
                                    Tài khoản
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={logout}>
                                <ListItemIcon>
                                    <LogoutIcon />
                                </ListItemIcon>
                                <Typography>
                                    Logout
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open
                    })
                }}
                open={open}>
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <List className={classes.list}>
                    {renderMenu('profile')}
                    {renderMenu('admin')}
                    {renderMenu('customer')}
                    {renderMenu('order')}
                    {renderMenu('bol')}
                    {renderMenu('variable')}
                    {renderMenu('area')}
                    {renderMenu('address')}
                    {renderMenu('cart')}
                    {renderMenu('rate')}
                    {renderMenu('serviceFee')}
                    {renderMenu('countCheck')}
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {children}
            </main>
        </div>
    );
};
export default withRouter(App);
