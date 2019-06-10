// @flow
import * as React from 'react';
import {apiUrls} from 'src/back/order/_data';
import Tools from 'src/utils/helpers/Tools';
import Editable from 'src/utils/components/Editable';
import {Service as OrderService} from 'src/back/order/';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import {STATUS} from 'src/back/order/_data';

type Props = {
    data: Object,
    addresses: SelectOptions,
    onPartialChange: Function
};

export default ({data, addresses, onPartialChange}: Props) => {
    return (
        <table className="table table-striped">
            <tbody>
                <tr>
                    <td>
                        <span>Thông tin đơn hàng:</span>
                        &nbsp;
                        <span>{data.uid}</span>
                    </td>
                    <td>
                        <span>Tên shop:</span>
                        &nbsp;
                        <span>{data.shop_nick}</span>
                    </td>
                    <td>
                        <span>Tỷ giá</span>
                        &nbsp;
                        <span className="cny mono">1</span>
                        <span> = </span>
                        <Editable
                            onChange={onPartialChange}
                            name="value"
                            value={data.rate}
                            endPoint={apiUrls.change_rate.replace('/pk-', `/${data.id}/`)}
                            type="number"
                            placeholder="Tỷ giá...">
                            <span className="vnd mono">{Tools.numberFormat(data.rate)}</span>
                        </Editable>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>Số link:</span>
                        &nbsp;
                        <span>{data.statistics.links}</span>
                    </td>
                    <td>
                        <span>Số SP:</span>
                        &nbsp;
                        <span>{data.statistics.packages}</span>
                    </td>
                    <td>
                        <span>Số kiện:</span>
                        &nbsp;
                        <span>{data.statistics.quantity}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>Địa chỉ:</span>
                        &nbsp;
                        <Editable
                            onChange={onPartialChange}
                            name="value"
                            value={data.address}
                            endPoint={apiUrls.change_address.replace('/pk-', `/${data.id}/`)}
                            type="select"
                            options={addresses}
                            placeholder="Địa chỉ...">
                            <span>{data.address_name}</span>
                        </Editable>
                    </td>
                    <td>
                        <span>Mã giảm giá:</span>
                        &nbsp;
                        <Editable
                            onChange={onPartialChange}
                            name="value"
                            value={data.voucher}
                            endPoint={apiUrls.change_voucher.replace('/pk-', `/${data.id}/`)}
                            placeholder="Voucher...">
                            <span>{data.voucher || 'Chưa sử dụng'}</span>
                        </Editable>
                    </td>
                    <td>
                        <span>Tổng:</span>
                        &nbsp;
                        <span className="mono vnd">{Tools.numberFormat(data.vnd_total)}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>Trạng thái:</span>
                        &nbsp;
                        <Editable
                            onChange={onPartialChange}
                            name="value"
                            value={String(data.status)}
                            endPoint={apiUrls.change_status.replace('/pk-', `/${data.id}/`)}
                            type="select"
                            options={OrderService.getStatusOptions()}
                            placeholder="Trạng thái">
                            <span>{data.status_name}</span>
                        </Editable>
                    </td>
                    <td colSpan="2">
                        <span>Mã giao dịch:</span>
                        &nbsp;
                        <Editable
                            onChange={onPartialChange}
                            name="value"
                            value={data.purchase_code}
                            endPoint={apiUrls.change_purchase_code.replace('/pk-', `/${data.id}/`)}
                            placeholder="Mã giao dịch">
                            <span>{data.purchase_code || 'Chưa có'}</span>
                        </Editable>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};
