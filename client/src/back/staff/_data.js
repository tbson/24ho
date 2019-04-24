/* @flow */

import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';
import {createContext} from 'react';

export const Context: React.Context<Object> = createContext({});

const rawApiUrls = [
    {
        controller: 'staff',
        endpoints: {
            crud: ''
        }
    },
    {
        controller: 'group',
        endpoints: {
            crud: ''
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export type FormOpenType = {
    main: boolean
};

export type FormOpenKeyType = 'main';

export type FormValues = {
    email: string,
    username: string,
    fullname?: string
};

export type DbRow = FormValues & {
    id: number
};

export type TRow = DbRow & {
    user_data: Object,
    checked: boolean,
    groups?: Array<Object>,
    is_lock: boolean,
    is_sale: boolean,
    is_cust_care: boolean
};

export type ListItem = Array<TRow>;
