/* @flow */

import Tools from 'src/utils/helpers/Tools';
import {FIELD_TYPE, APP} from 'src/constants';

const rawApiUrls = [
    {
        controller: 'role',
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
    permissions: Array<number>
};

export type DbRow = FormValues & {
    id: number
};

export type TRow = DbRow & {
    checked: boolean
};

export type ListItem = Array<TRow>;

export const pemGroupTrans = {
    address: 'Địa chỉ',
    area: 'Vùng',
    article: 'Bài viết',
    group: 'Nhóm',
    permission: 'Quyền',
    bag: 'Bao hàng',
    bol: 'Vận đơn',
    boldate: 'Vận đơn ngày',
    category: 'Danh mục',
    countcheck: 'Kiểm đếm',
    customer: 'Khách hàng',
    bank: 'Ngân hàng',
    deliveryfee: 'Phí vận chuyển',
    order: 'Đơn order',
    orderfee: 'Phí dịch vụ',
    orderitem: 'Mặt hàng',
    rate: 'Tỷ giá',
    receipt: 'Phiếu thu',
    staff: 'Nhân viên',
    transaction: 'Giao dịch ví điện tử',
    variable: 'Cấu hình',
}

export const excludeGroups = ['user', 'logentry', 'token', 'contenttype', 'session']
