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

export function seeding(numberOfItems: number, single: boolean = false): any {
    let result = [];
    for (let i = 1; i <= numberOfItems; i++) {
        result.push({
            id: i,
            uid: `key${i}`,
            value: `value ${i}`,
            checked: false
        });
    }
    if (!single) return result;
    return result[numberOfItems - 1];
}

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
    phone: string
};

export type ListItem = Array<TRow>;

export const defaultInputs: FormValues = {
    id: 0,
    email: '',
    username: ''
};
