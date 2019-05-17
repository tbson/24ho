/* @flow */

import Tools from 'src/utils/helpers/Tools';
import { FIELD_TYPE, APP } from 'src/constants';

const rawApiUrls = [
    {
        controller: 'category',
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
    title: string,
    type: string,
    single: boolean
};

export type DbRow = FormValues & {
    uid: string,
    id: number,
    order: number
};

export type TRow = DbRow & {
    checked: boolean
};

export type ListItem = Array<TRow>;
