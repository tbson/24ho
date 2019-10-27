// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing
import {Button, Checkbox} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {BoolOutput} from 'src/utils/components/TableUtils';
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
    showForm: Function,
    onCheck: Function,
    onRemove: Function
};
export default ({data, showForm, onCheck, onRemove}: RowPropTypes) => {
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
            <td className="id">{data.id}</td>
            <td className="email">{data.user_data.email}</td>
            <td className="username">{data.user_data.username}</td>
            <td className="fullname">{data.user_data.fullname}</td>
            <td className="is_sale">
                <BoolOutput value={data.is_sale} />
            </td>
            <td className="is_cust_care">
                <BoolOutput value={data.is_cust_care} />
            </td>
            <td className="groups">{data.group_names.join(', ')}</td>
            <td className="fullname">
                <BoolOutput value={!data.is_lock} />
            </td>
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
