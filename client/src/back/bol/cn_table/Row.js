// @flow
import * as React from 'react';
import {useState} from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow} from '../_data';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Editable from 'src/utils/components/Editable';

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
    total?: number,
    index?: number,
    preview?: boolean,
    item: TRow,
    onCheck?: Function,
    listBag: SelectOptions,
    onEdit: Function,
    onRemove: Function
};
export default ({preview = false, listBag=[], item, index = 0, total = 0, onEdit, onCheck, onRemove}: RowPropTypes) => {

    const [data, setData] = useState(item);

    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getDeleteMessage(1));
        r && Service.handleRemove(id).then(onRemove);
    };

    return (
        <tr>
            <th className="row25">
                {preview ? (
                    total - index
                ) : (
                    <input
                        id={id}
                        className="check"
                        type="checkbox"
                        checked={data.checked}
                        onChange={() => onCheck && onCheck(id)}
                    />
                )}
            </th>
            <td>{Tools.dateTimeFormat(data.created_at)}</td>
            <td>{data.uid}</td>
            <td>
                <Editable
                    onChange={setData}
                    name="data"
                    formater={parseInt}
                    endPoint={apiUrls.change_bag.replace('/pk-', `/${data.id}/`)}
                    type="select"
                    options={listBag}
                    placeholder="Bao hàng...">
                    <span>{data.bag_uid}</span>
                </Editable>
            </td>
            <td className="mono right">{data.mass}</td>
            <td className="mono right">{data.length}</td>
            <td className="mono right">{data.width}</td>
            <td className="mono right">{data.height}</td>
            <td className="mono right">{data.packages}</td>
            <td>{data.note}</td>
            <td className="center">
                <a className="editBtn" onClick={() => onEdit(preview ? data.uid : data.id)}>
                    <span className="fas fa-edit text-info pointer" />
                </a>
            </td>
        </tr>
    );
};
