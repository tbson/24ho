// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';

type Props = {
    data: Object
};

export default ({data}: Props) => {

    return (
        <table className="table table-striped">
            <tbody>
                <tr>
                    <td>
                        <span>Thông tin đơn hàng:</span>
                        &nbsp;
                        <span>{data.uid || '__UID__'}</span>
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
                        <span className="vnd mono">{Tools.numberFormat(data.rate)}</span>
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
                        <span>{data.address_name}</span>
                    </td>
                    <td>Mã giảm giá</td>
                    <td>
                        <span>Tổng:</span>
                        &nbsp;
                        <span className="mono vnd">{Tools.numberFormat(data.vnd_total)}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};
