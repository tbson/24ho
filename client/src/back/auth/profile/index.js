// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {APP} from 'src/constants';
import type {FormOpenType, FormOpenKeyType} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import NavWrapper from 'src/utils/components/nav_wrapper';
import ProfileForm from './Form';
import ChangePwdForm from '../PwdForm';
import AddressTable from 'src/back/address/main_table/';
import OnlyAdmin from 'src/utils/components/OnlyAdmin';

export class Service {
    static async profileRequest() {
        const url = `/api/v1/${Tools.mapApp(APP)}/profile/`;
        return await Tools.apiCall(url);
    }

    static handleProfileRequest(): Promise<Object> {
        return Service.profileRequest()
            .then(resp => (resp.ok ? resp.data || {} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }
}

export const Profile = () => {
    const [profile, setProfile] = useState({});

    const [formOpen, setFormOpen] = useState<FormOpenType>({
        resetPwd: false,
        changePwd: false,
        profile: false
    });

    const toggleForm = (value: boolean, key: FormOpenKeyType = 'profile') => setFormOpen({...formOpen, [key]: value});

    useEffect(() => {
        document.title = 'Profile manager';
        Service.handleProfileRequest().then(data => {
            data && setProfile(Tools.prepareUserData(data));
        });
    }, []);

    const onChangeProfile = (data: Object) => {
        toggleForm(false);
        setProfile(Tools.prepareUserData(data));
    };

    const onChangePwd = () => {
        toggleForm(false, 'changePwd');
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
                <button type="button" onClick={() => toggleForm(true)} className="btn btn-success">
                    Update profile
                </button>
                <button type="button" onClick={() => toggleForm(true, 'changePwd')} className="btn btn-primary">
                    Change password
                </button>
            </div>

            <ProfileForm open={formOpen.profile} close={() => toggleForm(false)} onChange={onChangeProfile}>
                <button type="button" className="btn btn-light" action="close" onClick={() => toggleForm(false)}>
                    Cancel
                </button>
            </ProfileForm>

            <OnlyAdmin reverse={true}>
                <div>
                    <hr />
                    <h2>Địa chỉ</h2>
                    <AddressTable />
                </div>
            </OnlyAdmin>

            <ChangePwdForm
                mode="change"
                open={formOpen.changePwd}
                close={() => toggleForm(false, 'changePwd')}
                onChange={onChangePwd}>
                <button
                    type="button"
                    className="btn btn-light"
                    action="close"
                    onClick={() => toggleForm(false, 'changePwd')}>
                    Cancel
                </button>
            </ChangePwdForm>
        </NavWrapper>
    );
};

export default withRouter(Profile);
