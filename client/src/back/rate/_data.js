/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'rate',
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
    rate: number,
    sub_delta: number,
    order_delta: number
};

export type DbRow = FormValues & {
    id: number,
    created_at: string
};

export type TRow = DbRow & {
    checked: boolean
};

export type ListItem = Array<TRow>;
