// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about Yup
import {Row, Col} from 'antd';
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
    const [message, setMessage] = useState('Đổi mật khẩu...');
    const logout = Tools.logout(history);
    const navigateTo = Tools.navigateTo(history);

    const onSuccess = () => {
        logout();
    };

    const onError = () => {
        const message = 'Sai link kích hoạt hoặc link kích hoạt đã hết hạn. Trỡ về trang login trong 4 giây.';
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
        <Row>
            <Col span={16} offset={4}>{message}</Col>
        </Row>
    );
};
export default withRouter(ResetPwd);
