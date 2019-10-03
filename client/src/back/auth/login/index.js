// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {Card, Row, Col, Button} from 'antd';
import {APP} from 'src/constants';
import type {FormOpenType, FormOpenKeyType} from '../_data';
import LoginForm from './Form';
import ResetPwdForm from '../PwdForm';
import {Service as ResetPwdFormService} from '../PwdForm';
import Tools from 'src/utils/helpers/Tools';

type Props = {
    history: Object
};

export const Login = ({history}: Props) => {
    const navigateTo = Tools.navigateTo(history);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        resetPwd: false,
        changePwd: false,
        profile: false
    });

    useEffect(() => {
        Tools.getToken() && navigateTo();
    });

    const onLogin = data => {
        const authData = Tools.prepareUserData(data.user);
        Tools.setStorage('auth', authData) || navigateTo();
    };

    const onResetPwd = () => {
        ResetPwdFormService.toggleForm(false);
        const message = 'Reset mật khẩu thành công, bạn vui lòng kiểm tra email để xác thực.';
        Tools.popMessage(message);
    };

    return (
        <Row>
            <Col span={8} offset={8} style={{paddingTop: 40}}>
                <Card size="medium" title={APP.toUpperCase() + ' LOGIN'} style={{width: '100%'}}>
                    <LoginForm onChange={onLogin}>
                        <Button onClick={() => ResetPwdFormService.toggleForm(true)}>Khôi phục mật khẩu</Button>
                    </LoginForm>
                </Card>

                <ResetPwdForm onChange={onResetPwd} />
            </Col>
        </Row>
    );
};

export default withRouter(Login);
