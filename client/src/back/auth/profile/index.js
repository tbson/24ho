// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {APP} from 'src/constants';
import type {FormOpenType, FormOpenKeyType} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import NavWrapperMaterial from 'src/utils/components/NavWrapperMaterial';
import ProfileForm from './Form';
import ChangePwdForm from '../PwdForm';
// $FlowFixMe: do not complain about importing node_modules
import {makeStyles} from '@material-ui/core/styles';
// $FlowFixMe: do not complain about importing node_modules
import Table from '@material-ui/core/Table';
// $FlowFixMe: do not complain about importing node_modules
import TableBody from '@material-ui/core/TableBody';
// $FlowFixMe: do not complain about importing node_modules
import TableCell from '@material-ui/core/TableCell';
// $FlowFixMe: do not complain about importing node_modules
import TableRow from '@material-ui/core/TableRow';
// $FlowFixMe: do not complain about importing node_modules
import Button from '@material-ui/core/Button';

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
    const useStyles = makeStyles(theme => ({
        button: {
            margin: theme.spacing(1)
        }
    }));

    const [profile, setProfile] = useState({});

    const [formOpen, setFormOpen] = useState<FormOpenType>({
        resetPwd: false,
        changePwd: false,
        profile: false
    });
    const classes = useStyles();

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
        <NavWrapperMaterial>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>{profile.email}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Tên đăng nhập</TableCell>
                        <TableCell>{profile.username}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Họ và tên</TableCell>
                        <TableCell>{profile.fullname}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <br />

            <Button variant="contained" className={classes.button} color="primary" onClick={() => toggleForm(true)}>
                Update profile
            </Button>
            <Button
                variant="contained"
                className={classes.button}
                color="secondary"
                onClick={() => toggleForm(true, 'changePwd')}>
                Change password
            </Button>

            <ProfileForm open={formOpen.profile} close={() => toggleForm(false)} onChange={onChangeProfile}>
                <button type="button" className="btn btn-light" action="close" onClick={() => toggleForm(false)}>
                    Cancel
                </button>
            </ProfileForm>

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
        </NavWrapperMaterial>
    );
};

export default withRouter(Profile);
