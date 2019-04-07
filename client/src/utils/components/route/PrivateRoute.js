// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Route, Redirect} from 'react-router-dom';
import Tools from 'src/utils/helpers/Tools';

type Props = Object;

export default (props: Props) => {
    if (Tools.getToken()) return <Route {...props} />;

    return (
        <Redirect
            to={{
                push: true,
                pathname: '/login',
                state: {from: props.location}
            }}
        />
    );
};
