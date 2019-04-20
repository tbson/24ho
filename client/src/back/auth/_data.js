/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: Tools.mapApp(APP),
        endpoints: {
            profile: 'profile',
            auth: 'auth',
            resetPassword: 'reset-password',
            changePassword: 'change-password'
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export type FormOpenType = {
    resetPwd: boolean,
    changePwd: boolean,
    profile: boolean
};

export type FormOpenKeyType = 'resetPwd' | 'changePwd' | 'profile';
