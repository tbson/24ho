// @flow
import * as React from 'react';
import {useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Popover from 'react-popover';
import Editable from 'src/utils/components/Editable';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import {apiUrls, STATUS} from '../_data';
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

type OptionsType = {
    sale: SelectOptions,
    cust_care: SelectOptions
};

type OrderInfoType = {
    data: TRow
};
const OrderInfo = ({data}: OrderInfoType) => {
    return (
        <>
            <table style={{width: '100%'}}>
                <tbody>
                    <tr>
                        <td style={{width: 100}}>
                            <img src={data.thumbnail} style={{width: 100}} />
                        </td>
                        <td>
                            <div>
                                <strong>__UID__</strong>
                                &nbsp;/&nbsp;
                                <span>{data.customer_name}</span>
                            </div>
                            <div>
                                <span>Ngày tạo:</span>
                                &nbsp;
                                <span>{Tools.dateTimeFormat(data.created_at)}</span>
                            </div>
                            <div>
                                <span>Shop:</span>
                                &nbsp;
                                <a href={data.shop_link}>{data.shop_nick}</a>
                            </div>
                            <div>
                                <button type="button" className="btn btn-primary btn-sm">
                                    <strong>{data.statistics.links || 0}</strong> <span>Link</span>
                                </button>
                                &nbsp;
                                <button type="button" className="btn btn-danger btn-sm">
                                    <strong>{data.statistics.quantity || 0}</strong> <span>SP</span>
                                </button>
                                &nbsp;
                                <button type="button" className="btn btn-warning btn-sm">
                                    <strong>{data.statistics.packages || 0}</strong> <span>Kiện</span>
                                </button>
                            </div>
                            <div>
                                <strong>{STATUS[data.status]}</strong>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};

type StaffsType = {
    data: TRow,
    options: OptionsType
};
const Staffs = ({data: _data, options}: StaffsType) => {
    const [data, setData] = useState(_data);
    return (
        <>
            <div>
                <span>Đặt hàng: </span>
                <Editable
                    onChange={setData}
                    name="sale"
                    value={data.sale}
                    endPoint={apiUrls.change_sale.replace('/pk-', `/${data.id}/`)}
                    type="select"
                    options={options.sale || []}
                    placeholder="NV đặt hàng">
                    <span className="test">{data.sale_name || 'Chưa gán'}</span>
                </Editable>
            </div>
            <div>
                <span>Chăm sóc: </span>
                <Editable
                    onChange={setData}
                    name="cust_care"
                    value={data.cust_care}
                    endPoint={apiUrls.change_cust_care.replace('/pk-', `/${data.id}/`)}
                    type="select"
                    options={options.cust_care || []}
                    placeholder="NV chăm sóc">
                    <span>{data.cust_care_name || 'Chưa gán'}</span>
                </Editable>
            </div>
            <div>
                <span>Duyệt đơn: </span>
                <span>{data.approver_name || 'Chưa duyệt'}</span>
            </div>
        </>
    );
};

type FinInfoType = {
    data: TRow
};
const FinInfo = ({data}: FinInfoType) => {
    const missing = data.vnd_total - data.vnd_total_discount - data.vnd_paid;
    return (
        <>
            <div className="row">
                <div className="col">Tổng tiền đơn:</div>
                <div className="col mono vnd">{Tools.numberFormat(data.vnd_total)}</div>
            </div>
            <div className="row">
                <div className="col">Đã thanh toán:</div>
                <div className="col mono vnd">{Tools.numberFormat(data.vnd_paid)}</div>
            </div>
            <div className="row">
                <div className="col">Chiết khấu:</div>
                <div className="col mono vnd">{Tools.numberFormat(data.vnd_total_discount)}</div>
            </div>
            <div className="row">
                <div className="col">Còn thiếu:</div>
                <div className="col mono vnd">{Tools.numberFormat(missing)}</div>
            </div>
        </>
    );
};

type RowPropTypes = {
    data: TRow,
    options: OptionsType,
    showForm: Function,
    onCheck: Function,
    onRemove: Function
};
export default ({data, options = {}, showForm, onCheck, onRemove}: RowPropTypes) => {
    const id = parseInt(data.id);

    const _onRemove = id => {
        const r = confirm(ListTools.getDeleteMessage(1));
        r && Service.handleRemove(id).then(onRemove);
    };

    return (
        <tr>
            <th className="row25">
                <input id={id} className="check" type="checkbox" checked={data.checked} onChange={() => onCheck(id)} />
            </th>
            <td>
                <OrderInfo data={data} />
            </td>
            <td>
                <Staffs data={data} options={options} />
            </td>
            <td>
                <FinInfo data={data} />
            </td>
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
