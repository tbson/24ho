// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import CustomModal from 'src/utils/components/CustomModal';
import {apiUrls} from './_data';
import Tools from 'src/utils/helpers/Tools';
import NavWrapper from 'src/utils/components/NavWrapper';
import UpdateProfileForm from './forms/UpdateProfileForm';
import ChangePasswordForm from './forms/ChangePasswordForm';

type Props = {};
type States = {
    authData: Object,
    profileModal: boolean,
    changePasswordModal: boolean,
    formValues: Object,
    errorMessage: Object
};
type ModalProps = {
    show: boolean,
    defaultValue: Object,
    errorMessage: Object,
    toggleModal: Function,
    handleSubmit: Function
};

export class Profile extends React.Component<Props, States> {
    state = {
        authData: Tools.getStorageObj('authData'),
        profileModal: false,
        changePasswordModal: false,
        formValues: {},
        errorMessage: {}
    };

    constructor(props: Props) {
        super(props);
    }

    componentDidMount = () => {
        document.title = 'Profile';
        Tools.apiCall(apiUrls.profile, 'GET');
    };

    updateProfile = async (event: Object) => {
        event.preventDefault();
        const data = Tools.formDataToObj(new FormData(event.target));

        const result = await Tools.apiCall(apiUrls.profile, 'POST', data);
        if (result.success) {
            const authData = result.data;
            Tools.setStorageObj({authData});
            this.setState({authData});
            this.toggleModal('profileModal');
        } else {
            const errorMessage = result.data;
            this.setState({errorMessage});
        }
    };

    changePassword = async (event: Object) => {
        event.preventDefault();
        const data = Tools.formDataToObj(new FormData(event.target));

        const result = await Tools.apiCall(apiUrls.changePassword, 'POST', data);
        if (result.success) {
            this.toggleModal('changePasswordModal');
        } else {
            const errorMessage = result.data;
            this.setState({errorMessage});
        }
    };

    toggleModal = (modalName: string, formValues: Object = {}) => {
        const state = Tools.toggleModal(this.state, modalName, formValues);
        this.setState(state);
    };

    getProfileToEdit = async () => {
        const result = await Tools.apiCall(apiUrls.profile, 'GET');
        this.toggleModal('profileModal', result.data);
    };

    render() {
        const {authData, formValues, errorMessage, profileModal, changePasswordModal} = this.state;

        const {email, username, fullname} = authData;

        const profileModalProps: ModalProps = {
            show: profileModal,
            defaultValue: formValues,
            errorMessage: errorMessage,
            toggleModal: this.toggleModal.bind(this, 'profileModal'),
            handleSubmit: this.updateProfile
        };

        const changePasswordModalProps: ModalProps = {
            show: changePasswordModal,
            defaultValue: {},
            errorMessage: errorMessage,
            toggleModal: this.toggleModal.bind(this, 'changePasswordModal'),
            handleSubmit: this.changePassword
        };

        return (
            <NavWrapper>
                <table className="table table-striped">
                    <tbody>
                        <tr>
                            <td>Email</td>
                            <td>{email}</td>
                        </tr>
                        <tr>
                            <td>Username</td>
                            <td>{username}</td>
                        </tr>
                        <tr>
                            <td>Fullname</td>
                            <td>{fullname}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="btn-group">
                    <button type="button" onClick={this.getProfileToEdit} className="btn btn-success">
                        Update profile
                    </button>
                    <button
                        type="button"
                        onClick={() => this.toggleModal('changePasswordModal')}
                        className="btn btn-primary">
                        Change password
                    </button>
                </div>
                <ProfileModal {...profileModalProps} />
                <ChangePasswordModal {...changePasswordModalProps} />
            </NavWrapper>
        );
    }
}

export const ProfileModal = ({show, defaultValue, errorMessage, toggleModal, handleSubmit}: ModalProps): React.Node => {
    if (!show) return null;
    return (
        <CustomModal open={true} close={toggleModal} title="Update profile" size="md">
            <UpdateProfileForm
                defaultValue={defaultValue}
                errorMessage={errorMessage}
                submitTitle="Update profile"
                handleSubmit={handleSubmit}>
                <button type="button" onClick={toggleModal} className="btn btn-light">
                    <span className="fas fa-times" />&nbsp; Cancel
                </button>
            </UpdateProfileForm>
        </CustomModal>
    );
};

export const ChangePasswordModal = ({
    show,
    defaultValue,
    errorMessage,
    toggleModal,
    handleSubmit
}: ModalProps): React.Node => {
    if (!show) return null;
    return (
        <CustomModal open={true} close={toggleModal} title="Change password" size="md">
            <ChangePasswordForm errorMessage={errorMessage} submitTitle="Change password" handleSubmit={handleSubmit}>
                <button type="button" onClick={toggleModal} className="btn btn-light">
                    <span className="fas fa-times" />&nbsp; Cancel
                </button>
            </ChangePasswordForm>
        </CustomModal>
    );
};

export default withRouter(Profile);
