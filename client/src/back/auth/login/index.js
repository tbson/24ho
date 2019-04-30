// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {APP} from 'src/constants';
import type {FormOpenType, FormOpenKeyType} from '../_data';
import Form from './Form';
import ResetPwdForm from '../PwdForm';
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

    const toggleForm = (value: boolean, key: FormOpenKeyType = 'resetPwd') => setFormOpen({...formOpen, [key]: value});

    useEffect(() => {
        Tools.getToken() && navigateTo();
    });

    const onLogin = data => {
        const authData = Tools.prepareUserData(data.user);
        Tools.setStorage('auth', authData) || navigateTo();
    };

    const onResetPwd = () => {
        toggleForm(false);
        const message = 'Reset password success. Please checking your email to confirm.';
        Tools.popMessage(message);
    };

    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <div className="jumbotron">
                            <h2 className="center">{APP.toUpperCase()} LOGIN</h2>
                            <Form onChange={onLogin}>
                                <span className="pointer link" onClick={() => toggleForm(true)}>
                                    Reset password
                                </span>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
            <ResetPwdForm open={formOpen.resetPwd} close={() => toggleForm(false)} onChange={onResetPwd}>
                <button type="button" className="btn btn-default" action="close" onClick={() => toggleForm(false)}>
                    Cancel
                </button>
            </ResetPwdForm>
        </>
    );
};

export default withRouter(Login);
