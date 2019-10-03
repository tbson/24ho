// @flow
import * as React from 'react';
import {useState} from 'react';
// $FlowFixMe: do not complain about importing
import {Button, Icon, Checkbox} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow} from '../_data';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Editable from 'src/utils/components/Editable';

export class Service {
    static unmarkRequest(id: number): Promise<Object> {
        return Tools.apiCall(apiUrls.unmarkCn + id, {}, 'PUT');
    }

    static handleUnmark(id: number): Promise<Object> {
        return Service.unmarkRequest(id)
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
    listBag?: SelectOptions,
    onEdit: Function,
    onRemove: Function
};
export default ({
    preview = false,
    listBag = [],
    item,
    index = 0,
    total = 0,
    onEdit,
    onCheck,
    onRemove
}: RowPropTypes) => {
    const [data, setData] = useState(item);

    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getConfirmMessage(1));
        r && Service.handleUnmark(id).then(onRemove);
    };

    return (
        <tr>
            <th className="row25">
                {preview ? total - index : <Checkbox checked={data.checked} onChange={() => onCheck(id)} />}
            </th>
            <td>{Tools.dateTimeFormat(data.created_at)}</td>
            <td>{data.uid}</td>
            <td>{data.address_code}</td>
            <td>
                <Editable
                    onChange={setData}
                    value={data.bag}
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
            <td className="mono right">
                {data.length} / {data.width} / {data.height}
            </td>
            <td className="mono right">{data.packages}</td>
            <td>{data.note}</td>
            <td className="center">
                <a onClick={() => onEdit(preview ? data.uid : data.id)}>
                    <Button size="small" icon="edit" />
                </a>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <a onClick={() => _onRemove(data.id)}>
                    <Button size="small" type="danger" icon="delete" />
                </a>
            </td>
        </tr>
    );
};
