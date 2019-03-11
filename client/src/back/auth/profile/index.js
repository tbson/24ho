// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import Tools from 'src/utils/helpers/Tools';
import NavWrapper from 'src/utils/components/nav_wrapper';
import ProfileForm from './Form';
import ChangePwdForm from '../PwdForm';

export class Service {
    static async profileRequest() {
        const url = '/api/v1/admin/profile/';
        return await Tools.apiCall(url);
    }
}

export const Profile = () => {
    const [profile, setProfile] = useState({});
    const [profileModal, setProfileModal] = useState(false);
    const [changePwdModal, setChangePwdModal] = useState(false);

    useEffect(() => {
        Service.profileRequest().then(resp => {
            resp.ok && setProfile(resp.data);
        });
    }, []);

    const onChangeProfile = (data: Object) => {
        setProfileModal(false);
        setProfile(data);
    };

    const onChangePwd = () => {
        setChangePwdModal(false);
    };

    return (
        <NavWrapper>
            <table className="table table-striped">
                <tbody>
                    <tr>
                        <td>Email</td>
                        <td>{profile.email}</td>
                    </tr>
                    <tr>
                        <td>Username</td>
                        <td>{profile.username}</td>
                    </tr>
                    <tr>
                        <td>Fullname</td>
                        <td>{profile.fullname}</td>
                    </tr>
                </tbody>
            </table>
            <div className="btn-group">
                <button type="button" onClick={() => setProfileModal(true)} className="btn btn-success">
                    Update profile
                </button>
                <button type="button" onClick={() => setChangePwdModal(true)} className="btn btn-primary">
                    Change password
                </button>
            </div>

            <ProfileForm open={profileModal} close={() => setProfileModal(false)} onChange={onChangeProfile}>
                <button type="button" className="btn btn-warning" action="close" onClick={() => setProfileModal(false)}>
                    <span className="fas fa-times" />
                    &nbsp;Cancel
                </button>
            </ProfileForm>

            <ChangePwdForm
                mode="change"
                open={changePwdModal}
                close={() => setChangePwdModal(false)}
                onChange={onChangePwd}>
                <button
                    type="button"
                    className="btn btn-warning"
                    action="close"
                    onClick={() => setChangePwdModal(false)}>
                    <span className="fas fa-times" />
                    &nbsp;Cancel
                </button>
            </ChangePwdForm>
        </NavWrapper>
    );
};

export default withRouter(Profile);
