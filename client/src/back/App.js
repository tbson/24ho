// @flow
import * as React from 'react';
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
import Order from './order/';
import OrderDetail from './order_detail/';
import Area from './area/';
import AreaDetail from './area/detail';
import Address from './address/';
import Cart from './cart/';
import Rate from './rate/';
import OrderFee from './order_fee/';
import DeliveryFee from './delivery_fee/';
import CountCheck from './count_check/';
import Bol from './bol/';
import Bag from './bag/';
import Check from './order/Check';
import CustomerBol from './bol/CustomerBol';
import BolCNAdding from './bol/CNAdding';
import Transaction from './transaction/';

import {APP} from 'src/constants';
import Trans from 'src/utils/helpers/Trans';
import translations from 'src/utils/translations.json';

type Props = {};

const AbstractBol = props => {
    return APP === 'admin' ? <Bol {...props} /> : <CustomerBol {...props} />;
};

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
                    <PrivateRoute exact path="/order" component={Order} />
                    <PrivateRoute exact path="/order/:id" component={OrderDetail} />
                    <PrivateRoute
                        path="/bol/:bagId?"
                        render={props => <AbstractBol {...props} key={props.match.params.bagId} />}
                    />
                    <PrivateRoute path="/bol-cn-adding/:bagId" component={BolCNAdding} />
                    <PrivateRoute path="/bag" component={Bag} />
                    <PrivateRoute path="/check" component={Check} />
                    <PrivateRoute path="/area" exact component={Area} />
                    <PrivateRoute path="/area/:id" exact component={AreaDetail} />
                    <PrivateRoute path="/address" component={Address} />
                    <PrivateRoute path="/cart" component={Cart} />
                    <PrivateRoute path="/rate" component={Rate} />
                    <PrivateRoute path="/order-fee" component={OrderFee} />
                    <PrivateRoute path="/delivery-fee" component={DeliveryFee} />
                    <PrivateRoute path="/count-check" component={CountCheck} />
                    <PrivateRoute path="/transaction" component={Transaction} />
                    <Route component={NotMatch} />
                </Switch>
            </div>
        );
    }
}

export default App;
