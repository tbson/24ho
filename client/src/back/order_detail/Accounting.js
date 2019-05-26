// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';

type Props = {
    data: Object
};

export default ({data}: Props) => {
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
        cny_count_check_fee_discount
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
                    <td className="mono vnd">{Tools.numberFormat(cny_order_fee)}</td>
                </tr>
                <tr>
                    <td>Kiểm đếm:</td>
                    <td className="mono cny">{Tools.numberFormat(cny_count_check_fee)}</td>
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
                    <td className="mono cny">{Tools.numberFormat(data.cny_inland_delivery_fee)}</td>
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
                    <td className="mono cny">{Tools.numberFormat(data.cny_order_fee_discount)}</td>
                </tr>
                <tr>
                    <td>Phí vận chuyển VN:</td>
                    <td className="mono vnd">{Tools.numberFormat(data.vnd_delivery_fee_discount)}</td>
                </tr>
                <tr>
                    <td>Kiểm đếm:</td>
                    <td className="mono cny">{Tools.numberFormat(data.cny_count_check_fee_discount)}</td>
                </tr>
            </tbody>
        </table>
    );
};
