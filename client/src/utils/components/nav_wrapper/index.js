// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {NavLink} from 'react-router-dom';
import Tools from 'src/utils/helpers/Tools';
import './styles.css';
import {APP} from 'src/constants';

type Props = {
    history: Object,
    location: Object,
    children: React.Node
};

const App = ({history, location, children}: Props) => {
    const [toggled, setToggled] = useState(window.innerWidth >= 768 ? true : false);

    const logout = Tools.logout(history);

    useEffect(() => {
        const mlq = window.matchMedia(`(min-width: 800px)`);
        mlq.addListener(mediaQueryChanged);
        return () => {
            mlq.removeListener(mediaQueryChanged);
        };
    }, []);

    const mediaQueryChanged = () => {
        setToggled(!toggled);
    };

    const toggleAll = () => {
        setToggled(!toggled);
    };

    const menuItem = (url: string, title: string, icon: string) => (
        <li>
            <NavLink exact={url ? false : true} to={`/${url}`}>
                <i className={icon} />
                {toggled ? <span>&nbsp;&nbsp;{title}</span> : null}
            </NavLink>
        </li>
    );

    const renderMenu = (menu: string) => {
        switch (menu) {
            case 'profile':
                return menuItem('', 'Tài khoản', 'fas fa-user');
            case 'admin':
                if (APP !== 'admin') return null;
                return menuItem('staff', 'Admin', 'fas fa-user-secret');
            case 'customer':
                if (APP !== 'admin') return null;
                return menuItem('customer', 'Khách hàng', 'fas fa-user-ninja');
            case 'order':
                return menuItem('order', 'Đơn order', 'fas fa-shipping-fast');
            case 'bol':
                return menuItem('bol', 'Vận đơn', 'fas fa-box');
            case 'bag':
                if (APP !== 'admin') return null;
                return menuItem('bag', 'Bao hàng', 'fas fa-box-open');
            case 'variable':
                if (APP !== 'admin') return null;
                return menuItem('variable', 'Cấu hình', 'fas fa-cog');
            case 'area':
                if (APP !== 'admin') return null;
                return menuItem('area', 'Vùng', 'fas fa-map-marker-alt');
            case 'address':
                if (APP !== 'user') return null;
                return menuItem('address', 'Địa chỉ', 'fas fa-map-marker-alt');
            case 'cart':
                if (APP !== 'user') return null;
                return menuItem('cart', 'Giỏ hàng', 'fas fa-shopping-cart');
            case 'rate':
                if (APP !== 'admin') return null;
                return menuItem('rate', 'Tỷ giá', 'fas fa-yen-sign');
            case 'orderFee':
                if (APP !== 'admin') return null;
                return menuItem('order-fee', 'Phí dịch vụ', 'fas fa-percent');
            case 'countCheck':
                if (APP !== 'admin') return null;
                return menuItem('count-check', 'Kiểm đếm', 'fas fa-tasks');
        }
    };

    const user = Tools.getStorageObj('auth');
    const fullname = `${user.last_name} ${user.first_name}`;

    return (
        <div id="wrapper" className={toggled ? 'toggled' : ''}>
            <div id="sidebar-wrapper">
                <div className="sidebar-brand">24HOrder</div>
                <ul className="sidebar-nav">
                    {renderMenu('profile')}
                    {renderMenu('admin')}
                    {renderMenu('customer')}
                    {renderMenu('order')}
                    {renderMenu('bol')}
                    {renderMenu('bag')}
                    {renderMenu('variable')}
                    {renderMenu('area')}
                    {renderMenu('address')}
                    {renderMenu('cart')}
                    {renderMenu('rate')}
                    {renderMenu('orderFee')}
                    {renderMenu('countCheck')}
                </ul>
            </div>

            <div id="page-content-wrapper">
                <div id="main-heading">
                    <span className="nav-toggler" onClick={toggleAll}>
                        &#9776;
                    </span>
                    <span>{fullname}</span>
                    &nbsp;&nbsp;
                    <i className="fas fa-sign-out-alt pointer" onClick={() => logout()} />
                </div>

                <div className="container-fluid">{children}</div>
            </div>
        </div>
    );
};
export default withRouter(App);
