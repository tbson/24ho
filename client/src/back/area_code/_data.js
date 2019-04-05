/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'area-code',
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
            title: `title ${i}`,
            checked: false
        });
    }
    if (!single) return result;
    return result[numberOfItems - 1];
}

export type FormValues = {
    uid: string,
    title: string,
    unit_price: number
};

export type DbRow = FormValues & {
    id: number
};

export type TRow = DbRow & {
    checked: boolean
};

export type ListItem = Array<TRow>;

export const defaultInputs: FormValues = {
    id: 0,
    uid: '',
    title: '',
    unit_price: 0
};
