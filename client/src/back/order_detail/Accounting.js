// @flow
import * as React from 'react';
import {apiUrls} from 'src/back/order/_data';
import Tools from 'src/utils/helpers/Tools';
import Editable from 'src/utils/components/Editable';

type Props = {
    data: Object,
    onPartialChange: Function
};

export default ({data, onPartialChange}: Props) => {
    const {rate} = data;
    const {
        cny_amount,
        cny_count_check_fee,
        cny_wooden_box_fee,
        cny_shockproof_fee,
        vnd_delivery_fee,
        cny_order_fee,
        cny_inland_delivery_fee,
        vnd_delivery_fee_discount,
        cny_order_fee_discount,
        cny_count_check_fee_discount,
        count_check_fee_input,
        order_fee_factor
    } = data;
    const total = {
        amount: data.cny_amount * rate,
        services: rate * (cny_count_check_fee + cny_wooden_box_fee + cny_shockproof_fee + cny_order_fee),
        deliveryFees: rate * cny_inland_delivery_fee + vnd_delivery_fee,
        discounts: rate * (cny_order_fee_discount + cny_count_check_fee_discount) + vnd_delivery_fee_discount
    };

    return (
        <table className="table table-sm">
            <thead>
                <tr>
                    <th>Tiền hàng</th>
                    <th className="mono vnd">{Tools.numberFormat(total.amount)}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Tiền hàng:</td>
                    <td className="mono cny">{Tools.numberFormat(cny_amount)}</td>
                </tr>
            </tbody>
            <thead>
                <tr>
                    <th>Dịch vụ đảm bảo</th>
                    <th className="mono vnd">{Tools.numberFormat(total.services)}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Phí dịch vụ:</td>
                    <td className="mono vnd">
                        <Editable
                            onChange={onPartialChange}
                            name="value"
                            value={order_fee_factor}
                            endPoint={apiUrls.change_order_fee_factor.replace('/pk-', `/${data.id}/`)}
                            type="number"
                            placeholder="Hệ số phí dịch vụ...">
                            <span>{order_fee_factor} % cố định</span>
                        </Editable>
                        <span>&nbsp;&rarr;&nbsp;</span>
                        <span>{Tools.numberFormat(cny_order_fee)}</span>
                    </td>
                </tr>
                <tr>
                    <td>Kiểm đếm:</td>
                    <td className="mono cny">
                        <Editable
                            onChange={onPartialChange}
                            name="value"
                            value={count_check_fee_input}
                            endPoint={apiUrls.change_count_check_fee_input.replace('/pk-', `/${data.id}/`)}
                            type="number"
                            placeholder="Phí kiểm đếm...">
                            <span>{Tools.numberFormat(cny_count_check_fee)}</span>
                        </Editable>
                    </td>
                </tr>
                <tr>
                    <td>Đóng gỗ:</td>
                    <td className="mono cny">{Tools.numberFormat(cny_wooden_box_fee)}</td>
                </tr>
                <tr>
                    <td>Chống sốc:</td>
                    <td className="mono cny">{Tools.numberFormat(cny_shockproof_fee)}</td>
                </tr>
            </tbody>
            <thead>
                <tr>
                    <th>Phí vận chuyển</th>
                    <th className="mono vnd">{Tools.numberFormat(total.deliveryFees)}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Nội địa TQ:</td>
                    <td className="mono cny">
                        <Editable
                            onChange={onPartialChange}
                            name="value"
                            value={cny_inland_delivery_fee}
                            endPoint={apiUrls.change_cny_inland_delivery_fee.replace('/pk-', `/${data.id}/`)}
                            type="number"
                            placeholder="Vận chuyển nội địa...">
                            <span>{Tools.numberFormat(cny_inland_delivery_fee)}</span>
                        </Editable>
                    </td>
                </tr>
                <tr>
                    <td>Nội địa VN:</td>
                    <td className="mono vnd">{Tools.numberFormat(data.vnd_delivery_fee)}</td>
                </tr>
            </tbody>
            <thead>
                <tr>
                    <th>Chiết khấu</th>
                    <th className="mono vnd">{Tools.numberFormat(total.discounts)}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Phí dịch vụ:</td>
                    <td className="mono cny">{Tools.numberFormat(cny_order_fee_discount)}</td>
                </tr>
                <tr>
                    <td>Phí vận chuyển VN:</td>
                    <td className="mono vnd">{Tools.numberFormat(vnd_delivery_fee_discount)}</td>
                </tr>
                <tr>
                    <td>Kiểm đếm:</td>
                    <td className="mono cny">{Tools.numberFormat(cny_count_check_fee_discount)}</td>
                </tr>
            </tbody>
        </table>
    );
};
