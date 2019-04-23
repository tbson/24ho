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
    buy_rate: number,
    sell_rate: number,
    order_rate: number
};

export type DbRow = FormValues & {
    id: number,
    created_at: string
};

export type TRow = DbRow & {
    checked: boolean
};

export type ListItem = Array<TRow>;

export const defaultInputs: FormValues = {
    id: 0,
    rate: 0,
    buy_rate: 0,
    sell_rate: 0,
    order_rate: 0
};
