// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import ShowWhen from 'src/utils/components/ShowWhen';
import {apiUrls} from '../_data';
import type {TRow} from '../_data';
import {BoolOutput} from 'src/utils/components/TableUtils';

export class Service {
    static removeRequest(id: number): Promise<Object> {
        return Tools.apiCall(apiUrls.crud + id, {}, 'DELETE');
    }

    static handleRemove(id: number): Promise<Object> {
        return Service.removeRequest(id)
            .then(resp => (resp.ok ? {id} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }
}

type RowPropTypes = {
    readonly?: boolean,
    data: TRow,
    showForm: Function,
    onCheck: Function,
    onRemove: Function
};
export default ({readonly = false, data, showForm, onCheck, onRemove}: RowPropTypes) => {
    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getDeleteMessage(1));
        r && Service.handleRemove(id).then(onRemove);
    };

    const getStatus = (item: TRow) => {
        if (item.exported_date) return <strong className="green">Xuất hàng</strong>;
        if (item.vn_date) return <strong className="blue">Kho VN</strong>;
        if (item.cn_date) return <strong className="red">Kho TQ</strong>;
        return <span>Phát hàng</span>;
    };

    return (
        <tr>
            <th className="row25">
                <ShowWhen value={!readonly}>
                    <input
                        id={id}
                        className="check"
                        type="checkbox"
                        checked={data.checked}
                        onChange={() => onCheck(id)}
                    />
                </ShowWhen>
            </th>
            <td>{Tools.dateTimeFormat(data.created_at)}</td>
            <td>
                <div>{data.uid}</div>
                {data.purchase_code && <div className="blue">{data.purchase_code}</div>}
            </td>
            <td>{data.address_code}</td>
            <td>{data.bag_uid}</td>
            <td>{getStatus(data)}</td>
            <td className="mono vnd">{Tools.numberFormat(data.vnd_delivery_fee)}</td>
            <td className="mono cny">{Tools.numberFormat(data.cny_insurance_fee)}</td>
            <td className="mono cny">
                {Tools.numberFormat(data.cny_sub_fee + data.cny_shockproof_fee + data.cny_wooden_box_fee)}
            </td>
            <td className="mono right">{data.mass}</td>
            <td className="mono right">
                <div>
                    {data.length} / {data.width} / {data.height}
                </div>
                <div>{Tools.numberFormat(data.mass_convert_factor)}</div>
            </td>
            <td className="mono right">{data.packages}</td>
            <td>{data.note}</td>
            <td className="center">
                <ShowWhen value={!readonly}>
                    <span>
                        <a className="editBtn" onClick={() => showForm(data.id)}>
                            <span className="fas fa-edit text-info pointer" />
                        </a>
                        <span>&nbsp;&nbsp;&nbsp;</span>
                        <a className="removeBtn" onClick={() => _onRemove(id)}>
                            <span className="fas fa-trash-alt text-danger pointer" />
                        </a>
                    </span>
                </ShowWhen>
            </td>
        </tr>
    );
};
