// @flow
import * as React from 'react';
import {useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Popover from 'react-popover';
// $FlowFixMe: do not complain about importing node_modules
import {Link} from 'react-router-dom';
import Editable from 'src/utils/components/Editable';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import {apiUrls, STATUS} from '../_data';
import type {OrderType} from '../_data';

const complaintDecideOptions = [
    {value: 1, label: 'Chấp nhận'},
    {value: 2, label: 'Lấy lại tiền'},
    {value: 3, label: 'Đổi hàng'}
];

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
    data: OrderType
};
const OrderInfo = ({data: _data}: OrderInfoType) => {
    const [data, setData] = useState(_data);
    return (
        <>
            <table style={{width: '100%'}}>
                <tbody>
                    <tr>
                        <td style={{width: 83}}>
                            <img src={data.thumbnail} style={{width: 83}} />
                        </td>
                        <td>
                            <div className="row">
                                <div className="col">
                                    <div>
                                        <Link className="editBtn" to={`/order/${data.id}`}>
                                            <strong>{data.uid}</strong>
                                        </Link>
                                        &nbsp;&rarr;&nbsp;
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
                                </div>
                                <div className="col">
                                    <div>
                                        <span>Trạng thái: </span>
                                        <strong>{data.status_name}</strong>
                                    </div>
                                    <div>
                                        <span>Mã giao dịch: </span>
                                        <Editable
                                            disabled={!Tools.isAdmin() || data.pending}
                                            onChange={setData}
                                            name="value"
                                            value={data.purchase_code}
                                            endPoint={apiUrls.change_purchase_code.replace('/pk-', `/${data.id}/`)}
                                            placeholder="Mã giao dịch">
                                            <span>{data.purchase_code || 'Chưa có'}</span>
                                        </Editable>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};

type StaffsType = {
    data: OrderType,
    options: OptionsType
};
const Staffs = ({data: _data, options}: StaffsType) => {
    const [data, setData] = useState(_data);
    return (
        <>
            <div>
                <span>Mua hàng: </span>
                <Editable
                    disabled={!Tools.isAdmin()}
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
                    disabled={!Tools.isAdmin()}
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
    data: OrderType
};
const FinInfo = ({data}: FinInfoType) => {
    const missing = data.vnd_total - data.vnd_total_discount - data.deposit;
    return (
        <>
            <div className="row">
                <div className="col">Tổng tiền đơn:</div>
                <div className="col mono vnd">{Tools.numberFormat(data.vnd_total)}</div>
            </div>
            <div className="row">
                <div className="col">Đã thanh toán:</div>
                <div className="col mono vnd">{Tools.numberFormat(data.deposit)}</div>
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

type ControlTypes = {
    id: number,
    pending: boolean,
    onRemove: Function
};
const Control = ({id, pending, onRemove}: ControlTypes) => {
    if (pending) {
        return (
            <div>
                <Editable
                    onChange={() => onRemove(id, true)}
                    type="select"
                    options={complaintDecideOptions}
                    name="decide"
                    value={1}
                    adding={true}
                    endPoint={apiUrls.complaintResolve.replace('/pk-', `/${id}/`)}
                    placeholder="Xử lý khiếu nại">
                    <span className="complaint-resolve-btn">
                        <span className="fas fa-question-circle text-danger pointer" />
                    </span>
                </Editable>
            </div>
        );
    }
    return (
        <div>
            <Link className="editBtn" to={`/order/${id}`}>
                <span className="fas fa-eye text-info pointer" />
            </Link>
            <span>&nbsp;&nbsp;&nbsp;</span>
            <a className="removeBtn" onClick={() => onRemove(id)}>
                <span className="fas fa-trash-alt text-danger pointer" />
            </a>
        </div>
    );
};

type RowPropTypes = {
    data: OrderType,
    options: OptionsType,
    onCheck: Function,
    onRemove: Function
};
export default ({data, options = {}, onCheck, onRemove}: RowPropTypes) => {
    const id = parseInt(data.id);
    const pending = !!data.pending;

    const _onRemove = (id, complaintResolve = false) => {
        if (complaintResolve) return onRemove({id});
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
                <Control id={id} pending={pending} onRemove={_onRemove} />
            </td>
        </tr>
    );
};
