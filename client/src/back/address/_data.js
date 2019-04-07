/* @flow */

import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';
import { createContext } from 'react';

export const Context: React.Context<Object> = createContext({});

const rawApiUrls = [
    {
        controller: 'address',
        endpoints: {
            crud: ''
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export type FormValues = {
    area: number,
    area_name?: string,
    uid?: string,
    title: string,
    phone: string,
    fullname: string
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
    area: 0,
    title: '',
    phone: '',
    fullname: '',
};
