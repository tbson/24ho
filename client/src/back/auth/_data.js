/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: APP,
        endpoints: {
            profile: 'profile',
            auth: 'auth',
            resetPassword: 'reset-password',
            changePassword: 'change-password',
        },
    },
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);
