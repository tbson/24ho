// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Link} from 'react-router-dom';
// $FlowFixMe: do not complain about importing
import {Button, Icon, Checkbox} from 'antd';
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

    static handleDiscard(id: number, status: number): Promise<Object> {
        let url = apiUrls.early_discard;
        if (status > 1) {
            url = apiUrls.discard;
        }
        if (status === 10) {
            url = apiUrls.renew_discard;
        }
        return Tools.apiClient(url.replace('pk-', `${id}/`), {}, 'POST').finally(() => {
            Tools.popMessage(`${status === 10 ? 'Phục hồi' : 'Huỷ'} đơn hàng thành công.`);
        });
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
    const [data, setData] = useState({});
    useEffect(() => {
        setData(_data);
    }, [_data]);
    if (Tools.isEmpty(data)) return null;
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
                                        <Button type="primary">
                                            <strong>{data.statistics.links || 0}</strong>&nbsp;<span>Link</span>
                                        </Button>
                                        &nbsp;
                                        <Button type="danger">
                                            <strong>{data.statistics.quantity || 0}</strong>&nbsp;<span>SP</span>
                                        </Button>
                                        &nbsp;
                                        <Button type="default">
                                            <strong>{data.statistics.packages || 0}</strong>&nbsp;<span>Kiện</span>
                                        </Button>
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
                <div className="col">Hệ số cọc:</div>
                <div className="col right mono">{Tools.numberFormat(data.deposit_factor)}%</div>
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
    status: number,
    pending: boolean,
    onRemove: Function,
    onDiscard: Function
};
const Control = ({id, status, pending, onRemove, onDiscard}: ControlTypes) => {
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
            <div style={{marginBottom: 10}}>
                <Button block type="default" icon="issues-close" onClick={() => onDiscard(id)}>
                    {status === 10 ? 'Dùng' : 'Huỷ'}
                </Button>
            </div>
            <div>
                <Button block type="danger" icon="delete" onClick={() => onRemove(id)}>
                    Xoá
                </Button>
            </div>
        </div>
    );
};

type RowPropTypes = {
    data: OrderType,
    options: OptionsType,
    onCheck: Function,
    onRemove: Function,
    onDiscard: Function
};
export default ({data, options = {}, onCheck, onRemove, onDiscard}: RowPropTypes) => {
    const id = parseInt(data.id);
    const status = parseInt(data.status);
    const pending = !!data.pending;

    const _onRemove = (id, complaintResolve = false) => {
        if (complaintResolve) return onRemove({id});
        const r = confirm(ListTools.getConfirmMessage(1, 'xoá', 'đơn order'));
        r && Service.handleRemove(id).then(onRemove);
    };

    const _onDiscard = (status: number) => (id: number) => {
        const r = confirm(ListTools.getConfirmMessage(1, status === 10 ? 'phục hồi' : 'huỷ', 'đơn order'));
        r && Service.handleDiscard(id, status).then(onDiscard);
    };

    return (
        <tr>
            <th className="row25 center">
                <Checkbox checked={data.checked} onChange={() => onCheck(id)} />
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
                <Control
                    id={id}
                    status={status}
                    pending={pending}
                    onRemove={_onRemove}
                    onDiscard={_onDiscard(status)}
                />
            </td>
        </tr>
    );
};
