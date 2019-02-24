// @flow
import * as React from 'react';
import CustomModal from 'src/utils/components/CustomModal';
import LoginForm from './LoginForm';

type PropTypes = {
    open: boolean,
    handleClose: Function,
    handleSubmit: Function,
};
class ResetPasswordModal extends React.Component<PropTypes> {
    static defaultProps = {
        open: false,
    };

    render() {
        if (!this.props.open) return null;
        return (
            <CustomModal open={true} close={this.props.handleClose} title="Reset password" size="md">
                <div>
                    <LoginForm
                        formId="resetPasswordForm"
                        submitTitle="Reset password"
                        handleSubmit={this.props.handleSubmit}>
                        <button type="button" onClick={this.props.handleClose} className="btn btn-light">
                            <span className="fas fa-trash-alt" />&nbsp; Cancel
                        </button>
                    </LoginForm>
                </div>
            </CustomModal>
        );
    }
}
export default ResetPasswordModal;
