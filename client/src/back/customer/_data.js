/* @flow */

import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';
import {createContext} from 'react';

export const Context: React.Context<Object> = createContext({});

const rawApiUrls = [
    {
        controller: 'customer',
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
    is_lock: boolean,
    sale: number,
    sale_name?: string,
    cust_care: number,
    cust_care_name?: string,
    phone: string,
    order_fee_factor: number,
    delivery_fee_unit_price: number,
    deposit_factor: number
};

export type ListItem = Array<TRow>;
