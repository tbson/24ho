// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Link} from 'react-router-dom';
// $FlowFixMe: do not complain about importing
import {Button, Icon, Checkbox} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import ShowWhen from 'src/utils/components/ShowWhen';
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
    readonly?: boolean,
    data: TRow,
    showForm: Function,
    onCheck: Function,
    onRemove: Function
};
export default ({readonly = false, data, showForm, onCheck, onRemove}: RowPropTypes) => {
    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getConfirmMessage(1));
        r && Service.handleRemove(id).then(onRemove);
    };

    return (
        <tr>
            <th className="row25 center">
                <ShowWhen value={!readonly}>
                    <Checkbox checked={data.checked} onChange={() => onCheck(id)} />
                </ShowWhen>
            </th>
            <td>
                <Link to={`/bol/${data.id}`}>{data.uid}</Link>
            </td>
            <td>{data.area_uid}</td>
            <td className="center">
                <ShowWhen value={!readonly}>
                    <div>
                        <a className="editBtn" onClick={() => showForm(data.id)}>
                            <Button size="small" icon="edit" />
                        </a>
                        <span>&nbsp;&nbsp;&nbsp;</span>
                        <a className="removeBtn" onClick={() => _onRemove(id)}>
                            <Button size="small" type="danger" icon="delete" />
                        </a>
                    </div>
                </ShowWhen>
            </td>
        </tr>
    );
};
