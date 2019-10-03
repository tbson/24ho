// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing
import {Button, Icon, Checkbox} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow} from '../_data';

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
    data: TRow,
    onPrint: Function,
    showForm: Function,
    onCheck: Function,
    onRemove: Function
};
export default ({data, showForm, onPrint, onCheck, onRemove}: RowPropTypes) => {
    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getConfirmMessage(1));
        r && Service.handleRemove(id).then(onRemove);
    };

    return (
        <tr>
            <th className="row25 center">
                <Checkbox checked={data.checked} onChange={() => onCheck(id)} />
            </th>
            <td>{Tools.dateTimeFormat(data.created_at)}</td>
            <td>{data.uid}</td>
            <td>{data.staff_username}</td>
            <td>{data.address_code}</td>
            <td className="mono vnd">{Tools.numberFormat(data.vnd_delivery_fee)}</td>
            <td className="mono vnd">{Tools.numberFormat(data.vnd_total - data.vnd_delivery_fee)}</td>
            <td className="mono vnd">{Tools.numberFormat(data.vnd_total)}</td>
            <td>{data.note}</td>
            <td className="center">
                <a className="printBtn" onClick={() => onPrint(data.id)}>
                    <Button size="small" icon="printer" />
                </a>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <a className="removeBtn" onClick={() => _onRemove(id)}>
                    <Button size="small" type="danger" icon="delete" />
                </a>
            </td>
        </tr>
    );
};
