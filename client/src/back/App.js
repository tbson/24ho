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

import Trans from 'src/utils/helpers/Trans';
import translations from 'src/utils/translations.json';

type Props = {};

class App extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        Trans.initTranslations(translations);
    }

    componentDidMount() {
        const body = window.document.body;
        body.style.backgroundImage = 'none';
    }

    setUpProps = (props: Object): Object => {
        const {parentType, parentId, id} = props.match.params;
        const parent = {type: parentType, id: parentId};
        if (!parent.id) {
            parent.id = 0;
        }
        return {...props, parent, id};
    };

    render() {
        return (
            <div>
                <Spinner />
                <ToastContainer autoClose={5000} />
                <Switch>
                    <Route exact path="/" component={Profile} />
                    <Route path="/login" component={Login} />
                    <Route path="/reset-password/:token" component={ResetPwd} />
                    <Route path="/variable" component={Variable} />
                    <Route path="/staff" component={Staff} />
                    <Route path="/customer" component={Customer} />
                    <Route path="/area" component={Area} />
                    <Route path="/address" component={Address} />
                    <Route component={NotMatch} />
                </Switch>
            </div>
        );
    }
}

export default hot(module)(App);
