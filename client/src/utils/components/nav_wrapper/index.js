// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {NavLink} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {Layout, Menu, Icon, Row, Col} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import {APP} from 'src/constants';

const {Header, Sider, Content} = Layout;

type Props = {
    history: Object,
    location: Object,
    children: React.Node
};
const Component = ({history, location, children}: Props) => {
    const [collapsed, setCollapsed] = useState(false);

    const toggle = () => {
        setCollapsed(!collapsed);
    };

    const logout = Tools.logout(history);
    const user = Tools.getStorageObj('auth');
    const fullname = `${user.last_name} ${user.first_name}`;

    const menuItem = (url: string, title: string, icon: string) => (
        <Menu.Item key={`/${url}`}>
            <NavLink exact={url ? false : true} to={`/${url}`}>
                <Icon type={icon} />
                <span>{title}</span>
            </NavLink>
        </Menu.Item>
    );
    const renderMenu = (menu: string) => {
        switch (menu) {
            case 'profile':
                return menuItem('', 'Trang cá nhân', 'home');
            case 'admin':
                if (APP !== 'admin') return null;
                return menuItem('staff', 'Admin', 'user-add');
            case 'customer':
                if (APP !== 'admin') return null;
                return menuItem('customer', 'Khách hàng', 'user');
            case 'transaction':
                return menuItem('transaction', 'Tài khoản', 'wallet');
            case 'order':
                return menuItem('order', 'Đơn order', 'tags');
            case 'bol':
                return menuItem('bol', 'Vận đơn', 'gold');
            case 'check':
                if (APP !== 'admin') return null;
                return menuItem('check', 'Kiểm hàng', 'check-circle');
            case 'bag':
                if (APP !== 'admin') return null;
                return menuItem('bag', 'Bao hàng', 'dropbox');
            case 'receipt':
                if (APP !== 'admin') return null;
                return menuItem('receipt', 'Phiếu xuất', 'export');
            case 'bank':
                if (APP !== 'admin') return null;
                return menuItem('bank', 'Ngân hàng', 'bank');
            case 'customer_bank':
                if (APP === 'admin') return null;
                return menuItem('customer-bank', 'Ngân hàng', 'bank');
            case 'printTransaction':
                if (APP !== 'admin') return null;
                return menuItem('print-transaction', 'Phiếu thu', 'file-protect');
            case 'role':
                if (APP !== 'admin') return null;
                return menuItem('role', 'Phân quyền', 'key');
            case 'variable':
                if (APP !== 'admin') return null;
                return menuItem('variable', 'Cấu hình', 'setting');
            case 'area':
                if (APP !== 'admin') return null;
                return menuItem('area', 'Vùng', 'environment');
            case 'cart':
                if (APP !== 'user') return null;
                return menuItem('cart', 'Giỏ hàng', 'shoping-cart');
            case 'rate':
                if (APP !== 'admin') return null;
                return menuItem('rate', 'Tỷ giá', 'money-collect');
            case 'orderFee':
                if (APP !== 'admin') return null;
                return menuItem('order-fee', 'Phí dịch vụ', 'percentage');
            case 'countCheck':
                if (APP !== 'admin') return null;
                return menuItem('count-check', 'Kiểm đếm', 'ordered-list');
        }
    };

    return (
        <Layout>
            <Sider theme="light" trigger={null} collapsible collapsed={collapsed}>
                {collapsed || <div style={styles.logo}>24HOrder</div>}
                <Menu theme="light" mode="inline" selectedKeys={[location.pathname]}>
                    {renderMenu('profile')}
                    {renderMenu('admin')}
                    {renderMenu('customer')}
                    {renderMenu('role')}
                    {renderMenu('transaction')}
                    {renderMenu('bag')}
                    {renderMenu('order')}
                    {renderMenu('bol')}
                    {renderMenu('check')}
                    {renderMenu('receipt')}
                    {renderMenu('printTransaction')}
                    {renderMenu('bank')}
                    {renderMenu('customer_bank')}
                    {renderMenu('variable')}
                    {renderMenu('area')}
                    {renderMenu('cart')}
                    {renderMenu('rate')}
                    {renderMenu('orderFee')}
                    {renderMenu('countCheck')}
                </Menu>
            </Sider>
            <Layout>
                <Header style={styles.header}>
                    <Icon style={styles.trigger} type={collapsed ? 'menu-unfold' : 'menu-fold'} onClick={toggle} />
                    <span style={styles.logout} onClick={logout}>
                        <span>{fullname}</span>
                        &nbsp;&nbsp;
                        <Icon type="logout" />
                    </span>
                </Header>
                <Content style={styles.content}>{children}</Content>
            </Layout>
        </Layout>
    );
};
const headerHeight = 40;
const styles = {
    header: {
        background: '#fff',
        padding: 0,
        height: headerHeight,
        position: 'relative'
    },
    logo: {
        fontWeight: 'bold',
        fontSize: '25px',
        paddingLeft: '25px'
    },
    trigger: {
        position: 'absolute',
        fontSize: `${headerHeight / 2}px`,
        top: headerHeight / 4
    },
    content: {
        background: '#fff',
        minHeight: 280
    },
    logout: {
        float: 'right',
        lineHeight: `${headerHeight}px`,
        cursor: 'pointer',
        paddingRight: '20px'
    }
};

export default withRouter(Component);
