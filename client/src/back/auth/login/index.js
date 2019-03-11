// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import Form from './Form';
import ResetPwdForm from '../PwdForm';
import Tools from 'src/utils/helpers/Tools';

type Props = {
    history: Object
};

export const Login = ({history}: Props) => {
    const navigateTo = Tools.navigateTo(history);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        Tools.getToken() && navigateTo();
    });

    const onLogin = data => {
        Tools.setStorage('auth', data) || navigateTo();
    };

    const onResetPwd = () => {
        setModal(false);
        const message = 'Reset password success. Please checking your email to confirm.';
        Tools.popMessage(message);
    };

    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <div className="jumbotron">
                            <h2 className="center">LOGIN</h2>
                            <Form onChange={onLogin}>
                                <span className="pointer link" onClick={() => setModal(true)}>
                                    Reset password
                                </span>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
            <ResetPwdForm open={modal} close={() => setModal(false)} onChange={onResetPwd}>
                <button type="button" className="btn btn-warning" action="close" onClick={() => setModal(false)}>
                    <span className="fas fa-times" />
                    &nbsp;Cancel
                </button>
            </ResetPwdForm>
        </>
    );
};

export default withRouter(Login);
