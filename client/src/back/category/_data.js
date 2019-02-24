/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'category',
        endpoints: {
            crud: '',
            landing: 'landing'
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export function seeding(numberOfItems: number, single: boolean = false): any {
    let result = [];
    for (let i = 1; i <= numberOfItems; i++) {
        result.push({
            id: i,
            title: `title ${i}`,
            uid: `title-${i}`,
            type: `type${i}`,
            image_ratio: 1.618,
            width_ratio: 100,
            single: false,
            checked: false
        });
    }
    if (!single) return result;
    return result[numberOfItems - 1];
}

export type CatType = {
    value: string,
    label: string
};

export type FormValues = {
    id: number,
    title: string,
    uid?: string,
    type: string,
    image_ratio: ?number,
    width_ratio: ?number,
    single: boolean
};

export const defaultFormValues: FormValues = {
    id: 0,
    title: '',
    type: '',
    image_ratio: 1.618,
    width_ratio: 100,
    single: false
};

export type FormValuesWithCheck = FormValues & {
    checked: boolean
};
