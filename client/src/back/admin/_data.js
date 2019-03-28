/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'admin',
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
    checked: boolean,
    groups?: Array<Object>,
    is_lock: boolean,
    is_sale: boolean,
    is_cust_care: boolean
};

export type ListItem = Array<TRow>;

export const defaultInputs: FormValues = {
    id: 0,
    email: '',
    username: ''
};
