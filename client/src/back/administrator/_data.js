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
            email: `email${i}@gmail.com`,
            username: `username${i}`,
            first_name: `first_name ${i}`,
            last_name: `last_name ${i}`,
            fullname: `fullname ${i}`,
            password: `password${i}`,
            groups: i,
            checked: false
        });
    }
    if (!single) return result;
    return result[numberOfItems - 1];
}

export type FormValues = {
    id?: number,
    email: string,
    username: string,
    first_name: string,
    last_name: string,
    fullname?: string,
    password?: string,
    groups: ?number
};

export const defaultFormValues: FormValues = {
    id: 0,
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    groups: null
};

export type FormValuesWithCheck = FormValues & {
    checked: boolean
};
