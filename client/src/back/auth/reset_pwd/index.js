// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';

export class Service {
    static async request(params: Object) {
        return await Tools.apiCall(apiUrls.resetPassword, params);
    }

    static handleRequest(onSuccess: Function, onError: Function) {
        return async (params: Object) => {
            const r = await Service.request(params);
            r.ok ? onSuccess() : onError();
        };
    }
}

type Props = {
    history: Object,
    match: Object
};
export const ResetPwd = ({history, match}: Props) => {
    const [message, setMessage] = useState('Resetting password...');
    const logout = Tools.logout(history);
    const navigateTo = Tools.navigateTo(history);

    const onSuccess = () => {
        logout();
    };

    const onError = () => {
        const message = 'Wrong token or token expired. Login page comming in 4 seconds.';
        setMessage(message);
        setTimeout(() => {
            navigateTo('/login');
        }, 4000);
    };

    useEffect(() => {
        const {params} = match;
        Service.handleRequest(onSuccess, onError)(params);
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8 offset-md-2">{message}</div>
            </div>
        </div>
    );
};
export default withRouter(ResetPwd);
