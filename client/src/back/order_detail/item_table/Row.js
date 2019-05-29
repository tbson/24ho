// @flow
import * as React from 'react';
import {vnd, cny} from 'src/constants';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from 'src/back/order/_data';
import type {OrderItemType} from 'src/back/order/_data';

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
    data: OrderItemType,
    onCheck: Function,
    onRemove: Function
};
export default ({data, onCheck, onRemove}: RowPropTypes) => {
    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getDeleteMessage(1));
        r && onRemove({id});
    };

    const {quantity, unit_price, price, rate} = data;
    const vnd_unit_price = unit_price * rate;
    const cny_price = price;
    const vnd_price = cny_price * rate;
    return (
        <tr>
            <th className="row25">
                <input id={id} className="check" type="checkbox" checked={data.checked} onChange={() => onCheck(id)} />
            </th>
            <td>
                <Description {...data} />
            </td>
            <td className="right mono">{data.quantity}</td>
            <td>
                <div className="vnd mono">{Tools.numberFormat(vnd_unit_price)}</div>
                <div className="cny mono">{Tools.numberFormat(unit_price)}</div>
            </td>
            <td>
                <div className="vnd mono">{Tools.numberFormat(vnd_price)}</div>
                <div className="cny mono">{Tools.numberFormat(cny_price)}</div>
            </td>
            <td>
                <Note {...data} />
            </td>
            <td className="center">
                <a className="removeBtn" onClick={() => _onRemove(id)}>
                    <span className="fas fa-trash-alt text-danger pointer" />
                </a>
            </td>
        </tr>
    );
};

export const Note = ({note}: OrderItemType) => {
    if (!note) return <em>Chưa có ghi chú...</em>;
    return note;
};

export const Description = ({title, image, color, size, link}: OrderItemType) => {
    return (
        <table width="100%">
            <tbody>
                <tr>
                    <td width="72px">
                        <img src={image} width="100%" />
                    </td>
                    <td>
                        <div>
                            <a href={link} target="_blank">
                                {title}
                            </a>
                        </div>
                        {color && (
                            <div>
                                <strong>Màu: </strong>
                                <span>{color}</span>
                            </div>
                        )}
                        {size && (
                            <div>
                                <strong>Size: </strong>
                                <span>{size}</span>
                            </div>
                        )}
                    </td>
                </tr>
            </tbody>
        </table>
    );
};
