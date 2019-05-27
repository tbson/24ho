/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'order',
        endpoints: {
            crud: '',
            change_sale: 'pk/change-sale',
            change_cust_care: 'pk/change-cust-care',
            change_rate: 'pk/change-rate',
            change_address: 'pk/change-address',
            change_voucher: 'pk/change-voucher',
            change_count_check_fee_input: 'pk/change-count-check-fee-input',
            change_cny_inland_delivery_fee: 'pk/change-cny-inland-delivery-fee',
            change_order_fee_factor: 'pk/change-cny-order-fee'
        }
    }
];

export const apiUrls = Tools.getApiUrls(rawApiUrls);

export const STATUS = {
    '0': 'Tất cả',
    '1': 'Chờ duyệt',
    '2': 'Đã duyệt',
    '3': 'Chờ thanh toán',
    '4': 'Đã thanh toán',
    '5': 'Đã phát hàng',
    '6': 'Về kho TQ',
    '7': 'Về kho VN',
    '8': 'Đã xuất hàng',
    '9': 'Hoàn thành',
    '10': 'Huỷ'
};

export type FormOpenType = {
    main: boolean
};

export type FormOpenKeyType = 'main';

export type FormValues = {
    created_at: string,
    status: number,
    thumbnail: string,
    shop_nick: string,
    shop_link: string,
    statistics: Object,
    customer_name: string,
    sale_name: string,
    sale: number,
    cust_care_name: string,
    cust_care: number,
    approver_name: string,
    approver: number,
    vnd_total: number,
    vnd_paid: number,
    vnd_total_discount: number
};

export type DbRow = FormValues & {
    id: number
};

export type TRow = DbRow & {
    checked: boolean
};

export type ListItem = Array<TRow>;
