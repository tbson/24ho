/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'permission',
        endpoints: {
            crud: ''
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export type FormValues = {
    id: number,
    name: string,
    content_type: string,
    codename: string
};

export function seeding(numberOfItems: number, single: boolean = false): any {
    let result = [];
    for (let i = 1; i <= numberOfItems; i++) {
        result.push({
            id: i,
            content_type: `content_type${i}`,
            name: `name ${i}`,
            codename: `codename${i}`,
            checked: false
        });
    }
    if (!single) return result;
    return result[numberOfItems - 1];
}

export const defaultFormValues: FormValues = {
    id: 0,
    name: '',
    content_type: '',
    codename: ''
};

export type FormValuesWithCheck = FormValues & {
    checked: boolean
};

export type RowValues = FormValuesWithCheck & {
    content_type: string,
    codename: string
};
