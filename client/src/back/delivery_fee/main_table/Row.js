// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing
import {Button, Checkbox} from 'antd';
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
        const r = confirm(ListTools.getConfirmMessage(1));
        r && Service.handleRemove(id).then(onRemove);
    };

    const unitClass = type === 1 ? 'kg' : 'm3';

    return (
        <tr>
            <th className="row25">
                <Checkbox checked={data.checked} onChange={() => onCheck(id)} />
            </th>
            <td className={`${unitClass} mono`}>{Tools.numberFormat(data.start)}</td>
            <td className={`${unitClass} mono`}>{Tools.numberFormat(data.stop)}</td>
            <td className="vnd mono">{Tools.numberFormat(data.vnd_unit_price)}</td>
            <td className="center">
                <a onClick={() => showForm(data.id)}>
                    <Button size="small" icon="edit" />
                </a>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <a onClick={() => _onRemove(id)}>
                    <Button size="small" type="danger" icon="delete" />
                </a>
            </td>
        </tr>
    );
};
