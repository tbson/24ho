// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter, Route, Link} from 'react-router-dom';
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

type State = {
    toggled: boolean,
    mql: Object
};

class App extends React.Component<Props, State> {
    logout: Function;
    state = {
        toggled: true,
        mql: {}
    };

    constructor(props) {
        super(props);
        this.logout = Tools.logout(this.props.history);
    }

    componentDidMount() {
        const mql = window.matchMedia(`(min-width: 800px)`);
        mql.addListener(this.mediaQueryChanged);
        this.setState({mql: mql});

        this.setState({
            toggled: window.innerWidth >= 800 ? true : false
        });
    }

    componentWillUnmount() {
        this.state.mql.removeListener(this.mediaQueryChanged);
    }

    mediaQueryChanged = () => {
        this.setState({
            toggled: !this.state.toggled
        });
    };

    toggleAll = () => {
        this.setState({
            toggled: !this.state.toggled
        });
    };

    menuItem(url: string, title: string, icon: string) {
        return (
            <li>
                <NavLink exact to={`/${url}`}>
                    <i className={icon} />
                    &nbsp;&nbsp;
                    <span>{title}</span>
                </NavLink>
            </li>
        );
    }

    renderMenu = (menu: string) => {
        switch (menu) {
            case 'profile':
                return this.menuItem('', 'Profile', 'fas fa-user');
            case 'admin':
                if (APP !== 'admin') return null;
                return this.menuItem('staff', 'Admin', 'fas fa-user-secret');
            case 'customer':
                if (APP !== 'admin') return null;
                return this.menuItem('customer', 'Customer', 'fas fa-user-ninja');
            case 'variable':
                if (APP !== 'admin') return null;
                return this.menuItem('variable', 'Variable', 'fas fa-cog');
            case 'area':
                if (APP !== 'admin') return null;
                return this.menuItem('area', 'Area', 'fas fa-map-marker-alt');
            case 'address':
                if (APP !== 'user') return null;
                return this.menuItem('address', 'Address', 'fas fa-map-marker-alt');
        }
    };

    render() {
        const {renderMenu} = this;
        const user = Tools.getStorageObj('auth');
        const fullname = `${user.last_name} ${user.first_name}`;
        return (
            <div id="wrapper" className={this.state.toggled ? 'toggled' : ''}>
                <div id="sidebar-wrapper">
                    <div className="sidebar-brand">24HOrder</div>
                    <ul className="sidebar-nav">
                        {renderMenu('profile')}
                        {renderMenu('admin')}
                        {renderMenu('customer')}
                        {renderMenu('variable')}
                        {renderMenu('area')}
                        {renderMenu('address')}
                    </ul>
                </div>

                <div id="page-content-wrapper">
                    <div id="main-heading">
                        <span id="nav-toggler" onClick={this.toggleAll}>
                            &#9776;
                        </span>
                        <span>{fullname}</span>
                        &nbsp;&nbsp;
                        <i className="fas fa-sign-out-alt pointer" onClick={() => this.logout()} />
                    </div>

                    <div className="container-fluid">{this.props.children}</div>
                </div>
            </div>
        );
    }
}
export default withRouter(App);
