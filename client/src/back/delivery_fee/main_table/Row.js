// @flow
import * as React from 'react';
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
    type: number,
    data: TRow,
    showForm: Function,
    onCheck: Function,
    onRemove: Function
};
export default ({type, data, showForm, onCheck, onRemove}: RowPropTypes) => {
    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getDeleteMessage(1));
        r && Service.handleRemove(id).then(onRemove);
    };

    const unitClass = type === 1 ? 'kg' : 'm3';

    return (
        <tr>
            <th className="row25">
                <input id={id} className="check" type="checkbox" checked={data.checked} onChange={() => onCheck(id)} />
            </th>
            <td className={`${unitClass} mono`}>{Tools.numberFormat(data.start)}</td>
            <td className={`${unitClass} mono`}>{Tools.numberFormat(data.stop)}</td>
            <td className="vnd mono">{Tools.numberFormat(data.vnd_unit_price)}</td>
            <td className="center">
                <a className="editBtn" onClick={() => showForm(data.id)}>
                    <span className="fas fa-edit text-info pointer" />
                </a>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <a className="removeBtn" onClick={() => _onRemove(id)}>
                    <span className="fas fa-trash-alt text-danger pointer" />
                </a>
            </td>
        </tr>
    );
};
