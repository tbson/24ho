/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'cart',
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
    site: string,

    title: string,

    color?: string,
    size?: string,

    link: string,
    image: string,

    rate: number,
    quantity: number,

    cny_unit_price: number,
    vnd_unit_price: number,

    cny_price: number,
    vnd_price: number,

    shop_link: string,
    shop_nick: string,

    note: string
};

export type DbRow = FormValues & {
    id: number
};

export type TRow = DbRow & {
    checked: boolean
};

export const defaultInputs = {
    id: 0, 
    quantity: 0,
    note: 0
}

export type ListItem = Array<TRow>;
