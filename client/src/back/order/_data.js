/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';
import type {SelectOptions} from 'src/utils/helpers/Tools';

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
            change_order_fee_factor: 'pk/change-order-fee-factor',
            change_purchase_code: 'pk/change-purchase-code',
            change_status: 'pk/change-status',
            change_shockproof: 'pk/change-shockproof',
            change_wooden_box: 'pk/change-wooden-box',
            change_count_check: 'pk/change-count-check',
            bulk_approve: 'bulk-approve',
            check: 'check',
            complaintResolve: 'pk/complaint-resolve',
            getOrderitemsForChecking: 'get-order-items-for-checking'
        }
    },
    {
        controller: 'orderItem',
        endpoints: {
            crud: '',
            change_color: 'pk/change-color',
            change_size: 'pk/change-size',
            change_quantity: 'pk/change-quantity',
            change_unit_price: 'pk/change-unit-price',
            change_note: 'pk/change-note'
        }
    }
];

export const booleanOptions: SelectOptions = [{value: true, label: 'Có'}, {value: false, label: 'Không'}];

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

export type OrderType = {
    id: number,
    uid: string,
    purchase_code: string,
    created_at: string,
    status: number,
    status_name: string,
    thumbnail: string,
    shop_nick: string,
    shop_link: string,
    statistics: Object,
    customer_name: string,
    sale_name: string,
    sale: number,
    rate: number,
    cust_care_name: string,
    cust_care: number,
    approver_name: string,
    approver: number,
    vnd_total: number,
    deposit: number,
    vnd_total_discount: number,
    checked: boolean,
    pending: boolean
};

export type ListOrderType = Array<OrderType>;

export type OrderItemType = {
    id: number,
    created_at: string,
    title: string,
    image: string,
    color: string,
    size: string,
    link: string,
    quantity: number,
    checked_quantity: number,
    unit_price: number,
    price: number,
    unit_price: number,
    rate: number,
    note: string,
    checked: boolean
};
