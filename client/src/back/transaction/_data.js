/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'transaction',
        endpoints: {
            crud: '',
            print: 'print',
            totalStatistics: 'total-statistics'
        }
    },
    {
        controller: 'customer',
        endpoints: {
            crud: ''
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export const listTypeSelect = {
    '1': 'Nạp tiền',
    // '2': 'Đặt cọc đơn',
    // '3': 'Thanh toán đơn hàng',
    '4': 'Rút tiền'
    // '5': 'Phí vận chuyển CN-VN',
    // '6': 'Phí vận chuyển nội địa VN',
    // '7': 'Phí bảo hiểm',
    // '8': 'Hoàn tiền khiếu nại',
    // '9': 'Hoàn tiền chiết khấu',
    // '10': 'Hoàn tiền huỷ đơn',
    // '11': 'Phụ phí khác'
};

export const listType = {
    '1': 'Nạp tiền',
    '2': 'Đặt cọc đơn',
    '3': 'Thanh toán đơn hàng',
    '4': 'Rút tiền',
    '5': 'Phí vận chuyển CN-VN',
    '6': 'Phí vận chuyển nội địa VN',
    '7': 'Phí bảo hiểm',
    '8': 'Hoàn tiền khiếu nại',
    '9': 'Hoàn tiền chiết khấu',
    '10': 'Hoàn tiền huỷ đơn',
    '11': 'Phụ phí khác'
};

export const listMoneyTypeSelect = {
    // '0': 'Gián tiếp',
    '1': 'Tiền mặt',
    '2': 'Chuyển khoản'
};

export const listMoneyType = {
    '0': 'Gián tiếp',
    '1': 'Tiền mặt',
    '2': 'Chuyển khoản'
};

export type FormOpenType = {
    main: boolean
};

export type FormOpenKeyType = 'main';

export type FormValues = {
    created_at: string,
    uid: string,
    amount: string,
    staff_username: string,
    customer_username: string,
    type: string,
    money_type: string,
    is_assets: string,
    balance: number,
    note: string
};

export type DbRow = FormValues & {
    id: number
};

export type TRow = DbRow & {
    checked: boolean
};

export type ListItem = Array<TRow>;
