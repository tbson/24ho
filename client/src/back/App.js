// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {hot} from 'react-hot-loader';
// $FlowFixMe: do not complain about importing node_modules
import {Switch, Route} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import 'bootstrap/dist/css/bootstrap.min.css';
// $FlowFixMe: do not complain about importing node_modules
import(/* webpackPreload: true */ '@fortawesome/fontawesome-free/css/all.css');
// $FlowFixMe: do not complain about importing node_modules
import {ToastContainer} from 'react-toastify';
// $FlowFixMe: do not complain about importing node_modules
import(/* webpackPreload: true */ 'rummernote/build/bs4/style.css');
// $FlowFixMe: do not complain about importing node_modules
import(/* webpackPreload: true */ 'bootstrap/dist/js/bootstrap');
import 'src/utils/styles/main-back.css';
import Spinner from 'src/utils/components/Spinner';
import NotMatch from 'src/utils/components/route/NotMatch';
import PrivateRoute from 'src/utils/components/route/PrivateRoute';
import Login from './auth/login/';
import Profile from './auth/profile/';
import ResetPwd from './auth/reset_pwd/';
import Variable from './variable/';
import Staff from './staff/';
import Customer from './customer/';
import Area from './area/';
import Address from './address/';
import Cart from './cart/';

import Trans from 'src/utils/helpers/Trans';
import translations from 'src/utils/translations.json';

type Props = {};

class App extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        Trans.initTranslations(translations);
    }

    render() {
        return (
            <div>
                <Spinner />
                <ToastContainer autoClose={5000} />
                <Switch>
                    <Route path="/login" component={Login} />
                    <Route path="/reset-password/:token" component={ResetPwd} />
                    <PrivateRoute exact path="/" component={Profile} />
                    <PrivateRoute path="/variable" component={Variable} />
                    <PrivateRoute path="/staff" component={Staff} />
                    <PrivateRoute path="/customer" component={Customer} />
                    <PrivateRoute path="/area" component={Area} />
                    <PrivateRoute path="/address" component={Address} />
                    <PrivateRoute path="/cart" component={Cart} />
                    <Route component={NotMatch} />
                </Switch>
            </div>
        );
    }
}

export default hot(module)(App);
