/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'area',
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
