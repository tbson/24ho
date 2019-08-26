/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'bol',
        endpoints: {
            crud: '',
            change_bag: 'pk/change-bag',
            get_date: 'date',
            match_vn: 'match-vn',
            check: 'check',
            getOrderitemsForChecking: 'get-order-items-for-checking',
            readyToExport: 'ready-to-export',
            export: 'export',
            exportCheck: 'export-check'
        }
    },
    {
        controller: 'address',
        endpoints: {
            crud: ''
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export const DeliveryFeeTypeOptions = [
    {value: 1, label: '1. Max lợi nhuận'},
    {value: 2, label: '2. Thang khối lượng'},
    {value: 3, label: '3. Đơn giá khối lượng'},
    {value: 4, label: '4. Khối lượng quy đổi'},
    {value: 5, label: '5. Thang mét khối'},
    {value: 6, label: '6. Đơn giá mét khối'}
];

export type FormOpenType = {
    main: boolean
};

export type FormOpenKeyType = 'main';

export type FormValues = {
    uid: string,
    address_code: string,
    bag_uid: string,
    bag: number,
    created_at: string,
    cn_date: string,
    vn_date: string,
    exported_date: string,
    vnd_delivery_fee: number,
    mass: number,
    length: number,
    width: number,
    height: number,
    packages: number,
    cny_insurance_fee: number,
    cny_sub_fee: number,
    cny_shockproof_fee: number,
    cny_wooden_box_fee: number,
    note: string
};

export type DbRow = FormValues & {
    id: number
};

export type TRow = DbRow & {
    checked: boolean
};

export type ListItem = Array<TRow>;
