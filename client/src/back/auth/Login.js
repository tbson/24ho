// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls} from './_data';
import Tools from 'src/utils/helpers/Tools';
import LoginForm from './forms/LoginForm';
import ResetPasswordModal from './forms/ResetPasswordModal';

type Props = {
    history: Object
};

type States = {
    modal: boolean,
    loginFail: boolean
};

export class Login extends React.Component<Props, States> {
    navigateTo: Function;
    state = {
        modal: false,
        loginFail: false
    };

    constructor(props: Props) {
        super(props);
        this.navigateTo = Tools.navigateTo.bind(undefined, this.props.history);
    }

    componentDidMount = () => {
        const authData = Tools.getStorageObj('authData');
        if (authData.email) {
            this.navigateTo();
        }
    };

    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    };

    handleSubmitLogin = async (event: Object) => {
        event.preventDefault();
        const data = Tools.formDataToObj(new FormData(event.target));
        const result = await Tools.apiCall(apiUrls.tokenAuth, 'POST', data);
        if (result.success) {
            Tools.setStorage('authData', result.data.user);
            this.navigateTo();
        } else {
            this.setState({
                loginFail: true
            });
        }
    };

    handleSubmitResetPassword = async (event: Object) => {
        event.preventDefault();
        const data = Tools.formDataToObj(new FormData(event.target));
        const result = await Tools.apiCall(apiUrls.resetPassword, 'POST', data);
        this.toggleModal();
    };

    render() {
        const {loginFail} = this.state;
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <div className="jumbotron">
                            <LoginForm formId="loginForm" submitTitle="Login" handleSubmit={this.handleSubmitLogin}>
                                <span className="pointer link" onClick={this.toggleModal}>
                                    Reset password
                                </span>
                                &nbsp;&nbsp;
                            </LoginForm>
                            <ErrorMessage loginFail={loginFail} />
                        </div>
                    </div>
                </div>
                <ResetPasswordModal
                    open={this.state.modal}
                    handleClose={() => this.setState({modal: false})}
                    handleSubmit={this.handleSubmitResetPassword}
                />
            </div>
        );
    }
}

type ErrorMessageProps = {
    loginFail: boolean
};
export const ErrorMessage = ({loginFail}: ErrorMessageProps): React.Node => {
    if (!loginFail) return null;
    return (
        <div className="alert alert-danger" role="alert" style={{marginTop: 16}}>
            Wrong username or password!
        </div>
    );
};

export default withRouter(Login);
