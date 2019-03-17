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

    renderMenu = (menu: string) => {
        switch (menu) {
            case 'profile':
                return (
                    <li>
                        <NavLink exact to="/">
                            <i className="fas fa-user" />&nbsp;&nbsp;
                            <span>Profile</span>
                        </NavLink>
                    </li>
                );
            case 'administrator':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink exact to="/administrator">
                            <i className="fas fa-user-secret" />&nbsp;&nbsp;
                            <span>Administrator</span>
                        </NavLink>
                    </li>
                );
            case 'freelancer':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink exact to="/freelancer">
                            <i className="fas fa-user-ninja" />&nbsp;&nbsp;
                            <span>Freelancer</span>
                        </NavLink>
                    </li>
                );
            case 'employer':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink exact to="/employer">
                            <i className="fas fa-user-tie" />&nbsp;&nbsp;
                            <span>Employer</span>
                        </NavLink>
                    </li>
                );
            case 'variable':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink exact to="/variable">
                            <i className="fas fa-cog" />&nbsp;&nbsp;
                            <span>Variable</span>
                        </NavLink>
                    </li>
                );
            case 'group':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink exact to="/group">
                            <i className="fas fa-users" />&nbsp;&nbsp;
                            <span>Group</span>
                        </NavLink>
                    </li>
                );
            case 'permission':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink exact to="/permission">
                            <i className="fas fa-unlock" />&nbsp;&nbsp;
                            <span>Permission</span>
                        </NavLink>
                    </li>
                );
            case 'category':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink exact to="/category/">
                            <i className="fas fa-folder" />&nbsp;&nbsp;
                            <span>Category</span>
                        </NavLink>
                    </li>
                );
            case 'tag':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink exact to="/tag/">
                            <i className="fas fa-tag" />&nbsp;&nbsp;
                            <span>Tag</span>
                        </NavLink>
                    </li>
                );
            case 'banner':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink
                            exact
                            to="/category/banner"
                            className={Tools.matchPrefix('/banner', this.props.location.pathname) ? ' active' : ''}>
                            <i className="fas fa-images" />&nbsp;&nbsp;
                            <span>Banner</span>
                        </NavLink>
                    </li>
                );
            case 'article':
                if (APP !== 'admin') return null;
                return (
                    <li>
                        <NavLink
                            exact
                            to="/category/article"
                            className={Tools.matchPrefix('/article', this.props.location.pathname) ? ' active' : ''}>
                            <i className="fas fa-newspaper" />&nbsp;&nbsp;
                            <span>Article</span>
                        </NavLink>
                    </li>
                );
        }
    };

    render() {
        const {renderMenu} = this;
        return (
            <div id="wrapper" className={this.state.toggled ? 'toggled' : ''}>
                <div id="sidebar-wrapper">
                    <div className="sidebar-brand">24HOrder</div>
                    <ul className="sidebar-nav">
                        {renderMenu('profile')}
                        {renderMenu('variable')}
                        {/*
                        {renderMenu('administrator')}
                        {renderMenu('freelancer')}
                        {renderMenu('employer')}
                        {renderMenu('group')}
                        {renderMenu('permission')}
                        {renderMenu('category')}
                        {renderMenu('tag')}
                        {renderMenu('banner')}
                        {renderMenu('article')}
                        */}
                    </ul>
                </div>

                <div id="page-content-wrapper">
                    <div id="main-heading">
                        <span id="nav-toggler" onClick={this.toggleAll}>
                            &#9776;
                        </span>
                        <span>Tran Bac Son</span>
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
