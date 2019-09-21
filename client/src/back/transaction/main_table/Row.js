// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls, listType, listMoneyType} from '../_data';
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
    showForm: Function,
    onCheck: Function,
    onRemove: Function
};
export default ({data, showForm, onCheck, onRemove}: RowPropTypes) => {
    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getDeleteMessage(1));
        r && Service.handleRemove(id).then(onRemove);
    };

    return (
        <tr>
            {Tools.isAdmin() && (
                <th className="row25">
                    <input
                        id={id}
                        className="check"
                        type="checkbox"
                        checked={data.checked}
                        onChange={() => onCheck(id)}
                    />
                </th>
            )}
            <td className="mono">
                <span>{Tools.dateTimeFormat(data.created_at)}</span>
            </td>
            <td className="mono">{Tools.txCodeFormat(data.uid)}</td>
            <td>{listType[String(data.type)]}</td>
            <td className="mono vnd">{Tools.numberFormat(parseInt(data.is_assets ? data.amount : 0))}</td>
            <td className="mono vnd">{Tools.numberFormat(parseInt(data.is_assets ? 0 : data.amount))}</td>
            <td className="mono vnd">{Tools.numberFormat(parseInt(data.balance))}</td>
            <td>{listMoneyType[String(data.money_type)]}</td>
            {Tools.isAdmin() && <td>{data.staff_username}</td>}
            {Tools.isAdmin() && <td>{data.customer_username}</td>}
            <td>{data.note}</td>
            {Tools.isAdmin() && (
                <td className="center">
                    <a className="editBtn" onClick={() => showForm(data.id)}>
                        <span className="fas fa-edit text-info pointer" />
                    </a>
                    <span>&nbsp;&nbsp;&nbsp;</span>
                    <a className="removeBtn" onClick={() => _onRemove(id)}>
                        <span className="fas fa-trash-alt text-danger pointer" />
                    </a>
                </td>
            )}
        </tr>
    );
};
