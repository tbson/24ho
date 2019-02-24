/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'banner',
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
            category_title: `category ${i}`,
            description: `description ${i}`,
            image: undefined,
            order: i,
            checked: false
        });
    }
    if (!single) return result;
    return result[numberOfItems - 1];
}

export type FormValues = {
    id: number,
    uuid: string,
    category: ?number,
    category_title: ?string,
    title: string,
    description: string,
    image: ?Blob,
    order: ?number
};

export const defaultFormValues: FormValues = {
    id: 0,
    uuid: '',
    category: null,
    category_title: '',
    title: '',
    description: '',
    image: null,
    order: null
};

export type FormValuesWithCheck = FormValues & {
    checked: boolean
};
