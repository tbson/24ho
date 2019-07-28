// @flow
import * as React from 'react';
import {vnd, cny} from 'src/constants';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import Editable from 'src/utils/components/Editable';
import {apiUrls} from 'src/back/order/_data';
import type {OrderItemType} from 'src/back/order/_data';

export class Service {
    static removeRequest(id: number): Promise<Object> {
        return Tools.apiCall(apiUrls.orderItemCrud + id, {}, 'DELETE');
    }

    static handleRemove(id: number): Promise<Object> {
        return Service.removeRequest(id)
            .then(resp => (resp.ok ? {id} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }
}

type RowPropTypes = {
    pending?: boolean,
    data: OrderItemType,
    onCheck: Function,
    onRemove: Function,
    onPartialChange: Function
};
export default ({pending = false, data, onCheck, onRemove, onPartialChange}: RowPropTypes) => {
    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getDeleteMessage(1));
        r && Service.handleRemove(id).then(onRemove);
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
                <Description pending={pending} data={data} onPartialChange={onPartialChange} />
            </td>
            <td className="right mono">
                {pending && (
                    <>
                        <span>{data.checked_quantity}</span>
                        <span>/</span>
                    </>
                )}
                <Editable
                    disabled={!Tools.isAdmin() || pending}
                    onChange={onPartialChange}
                    name="value"
                    value={data.quantity}
                    endPoint={apiUrls.orderItemChange_quantity.replace('/pk-', `/${id}/`)}
                    type="number"
                    placeholder="Số lượng...">
                    <span>{data.quantity}</span>
                </Editable>
            </td>
            <td>
                <div className="cny mono">
                    <Editable
                        disabled={!Tools.isAdmin() || pending}
                        onChange={onPartialChange}
                        name="value"
                        value={data.unit_price}
                        endPoint={apiUrls.orderItemChange_unit_price.replace('/pk-', `/${id}/`)}
                        type="number"
                        placeholder="Đơn giá...">
                        <span>{Tools.numberFormat(unit_price)}</span>
                    </Editable>
                </div>
                <div className="vnd mono">{Tools.numberFormat(vnd_unit_price)}</div>
            </td>
            <td>
                <div className="cny mono">{Tools.numberFormat(cny_price)}</div>
                <div className="vnd mono">{Tools.numberFormat(vnd_price)}</div>
            </td>
            <td>
                <Editable
                    disabled={!Tools.isAdmin() || pending}
                    onChange={onPartialChange}
                    name="value"
                    value={data.note}
                    endPoint={apiUrls.orderItemChange_note.replace('/pk-', `/${id}/`)}
                    placeholder="Ghi chú...">
                    <span>{data.note ? data.note : <em>Chưa có ghi chú...</em>}</span>
                </Editable>
            </td>
            <td className="center">
                {pending || (
                    <a className="removeBtn" onClick={() => _onRemove(id)}>
                        <span className="fas fa-trash-alt text-danger pointer" />
                    </a>
                )}
            </td>
        </tr>
    );
};

type DescriptionType = {
    pending: boolean,
    data: OrderItemType,
    onPartialChange: Function
};
export const Description = ({
    pending,
    data: {id, title, image, color, size, link},
    onPartialChange
}: DescriptionType) => {
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
                                <Editable
                                    disabled={!Tools.isAdmin() || pending}
                                    onChange={onPartialChange}
                                    name="value"
                                    value={color}
                                    endPoint={apiUrls.orderItemChange_color.replace('/pk-', `/${id}/`)}
                                    placeholder="Màu sắc...">
                                    <span>{color}</span>
                                </Editable>
                            </div>
                        )}
                        {size && (
                            <div>
                                <strong>Size: </strong>
                                <Editable
                                    disabled={!Tools.isAdmin() || pending}
                                    onChange={onPartialChange}
                                    name="value"
                                    value={size}
                                    endPoint={apiUrls.orderItemChange_size.replace('/pk-', `/${id}/`)}
                                    placeholder="Kích cỡ...">
                                    <span>{size}</span>
                                </Editable>
                            </div>
                        )}
                    </td>
                </tr>
            </tbody>
        </table>
    );
};
