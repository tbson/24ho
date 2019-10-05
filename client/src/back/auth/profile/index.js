// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about formik
import {Button, Divider} from 'antd';
import {APP} from 'src/constants';
import type {FormOpenType, FormOpenKeyType} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import NavWrapper from 'src/utils/components/nav_wrapper';
import ProfileForm from './Form';
import {Service as ProfileFormService} from './Form';
import ChangePwdForm from '../PwdForm';
import {Service as ChangePwdFormService} from '../PwdForm';
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

    useEffect(() => {
        document.title = 'Profile manager';
        Service.handleProfileRequest().then(data => {
            data && setProfile(Tools.prepareUserData(data));
        });
    }, []);

    const onChangeProfile = (data: Object) => {
        ProfileFormService.toggleForm(false);
        setProfile(Tools.prepareUserData(data));
    };

    const onChangePwd = () => {
        ChangePwdFormService.toggleForm(false);
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
                        <td>Tên đăng nhập</td>
                        <td>{profile.username}</td>
                    </tr>
                    <tr>
                        <td>Tên đầy đủ</td>
                        <td>{profile.fullname}</td>
                    </tr>
                </tbody>
            </table>
            <div style={{paddingLeft: 10}}>
                <Button type="primary" onClick={() => ProfileFormService.toggleForm(true)}>
                    Cập nhật thông tin cá nhân
                </Button>
                &nbsp;
                <Button onClick={() => ChangePwdFormService.toggleForm(true)}>Đổi mật khẩu</Button>
            </div>

            <OnlyAdmin reverse={true}>
                <div>
                    <Divider />
                    <h2 style={{paddingLeft: 10}}>Địa chỉ</h2>
                    <AddressTable />
                </div>
            </OnlyAdmin>

            <ProfileForm onChange={onChangeProfile} />
            <ChangePwdForm mode="change" onChange={onChangePwd} />
        </NavWrapper>
    );
};

export default withRouter(Profile);
