// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import MainForm from '../MainForm';
import {Service as MainFormService} from '../MainForm';
import Row from './Row.js';

type Props = {};

export class Service {
    static listRequest(url?: string, params?: Object): Promise<Object> {
        return Tools.apiCall(url ? url : apiUrls.crud, params);
    }

    static bulkRemoveRequest(ids: Array<number>): Promise<Object> {
        return Tools.apiCall(apiUrls.crud, {ids: ids.join(',')}, 'DELETE');
    }

    static handleGetList(url?: string, params?: Object = {}): Promise<Object> {
        return Service.listRequest(url, params)
            .then(resp => (resp.ok ? resp.data || {} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }

    static handleBulkRemove(ids: Array<number>): Promise<Object> {
        return Service.bulkRemoveRequest(ids)
            .then(resp => (resp.ok ? {ids} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }

    static listType = {
        '1': 'Nạp tiền',
        '2': 'Đặt cọc đơn',
        '3': 'Thanh toán đơn hàng',
        '4': 'Rút tiền',
        '5': 'Phí vận chuyển CN-VN',
        '6': 'Phí vận chuyển nội địa VN',
        '7': 'Hoàn tiền khiếu nại',
        '8': 'Hoàn tiền chiết khấu',
        '9': 'Hoàn tiền huỷ đơn',
        '10': 'Phụ phí khác'
    };

    static listMoneyType = {
        '0': 'Gián tiếp',
        '1': 'Tiền mặt',
        '2': 'Chuyển khoản'
    };

    static objToOptions(obj: Object): SelectOptions {
        return Object.entries(obj).map(([value, label]) => ({
            value: parseInt(value),
            label: `${value} - ${String(label)}`
        }));
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [listCustomer, setListCustomer] = useState([]);
    const [links, setLinks] = useState({next: '', previous: ''});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, _params?: Object) => {
        let params = {..._params};
        if (!listCustomer.length) {
            params = {...params, customers: true};
        }
        const data = await Service.handleGetList(url, params);
        if (!data) return;
        setList(ListTools.prepare(data.items));
        setLinks(data.links);
        listCustomer.length || setListCustomer(data.extra.list_customer || []);
    };

    const onChange = (data: TRow, type: string) => {
        MainFormService.toggleForm(false);
        setList(listAction(data)[type]());
    };

    const onCheck = id => setList(ListTools.checkOne(id, list));

    const onCheckAll = () => setList(ListTools.checkAll(list));

    const onRemove = data => setList(listAction(data).remove());

    const onBulkRemove = () => {
        const ids = ListTools.getChecked(list);
        if (!ids.length) return;

        const r = confirm(ListTools.getDeleteMessage(ids.length));
        r && Service.handleBulkRemove(ids).then(data => setList(listAction(data).bulkRemove()));
    };

    const searchList = (keyword: string) => getList('', keyword ? {search: keyword} : {});

    useEffect(() => {
        getList();
    }, []);

    return (
        <div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th className="row25">
                            <span className="fas fa-check text-info pointer check-all-button" onClick={onCheckAll} />
                        </th>
                        <th scope="col">Ngày</th>
                        <th scope="col" className="right">Số lượng</th>
                        <th scope="col">Mã giao dịch</th>
                        <th scope="col">Nhân viên giao dịch</th>
                        <th scope="col">Khách hàng</th>
                        <th scope="col">Loại giao dịch</th>
                        <th scope="col">Loại tiền</th>
                        <th scope="col">Ghi chú</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            <button
                                className="btn btn-primary btn-sm btn-block add-button"
                                onClick={() => MainFormService.toggleForm(true)}>
                                <span className="fas fa-plus" />
                                &nbsp; Add
                            </button>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td colSpan="99" style={{padding: 15, paddingBottom: 0}}>
                            <SearchInput onSearch={searchList} />
                        </td>
                    </tr>
                </tbody>

                <tbody>
                    {list.map((data, key) => (
                        <Row
                            className="table-row"
                            data={data}
                            key={key}
                            onCheck={onCheck}
                            onRemove={onRemove}
                            showForm={id => MainFormService.toggleForm(true, id)}
                        />
                    ))}
                </tbody>

                <tfoot className="thead-light">
                    <tr>
                        <th className="row25">
                            <span
                                className="fas fa-trash-alt text-danger pointer bulk-remove-button"
                                onClick={onBulkRemove}
                            />
                        </th>
                        <th className="row25 right" colSpan="99">
                            <Pagination next={links.next} prev={links.previous} onNavigate={getList} />
                        </th>
                    </tr>
                </tfoot>
            </table>

            <MainForm
                listCustomer={listCustomer.map(item => ({value: item.id, label: item.username}))}
                listType={Service.objToOptions(Service.listType)}
                listMoneyType={Service.objToOptions(Service.listMoneyType)}
                close={() => MainFormService.toggleForm(false)}
                onChange={onChange}>
                <button
                    type="button"
                    className="btn btn-light"
                    action="close"
                    onClick={() => MainFormService.toggleForm(false)}>
                    Cancel
                </button>
            </MainForm>
        </div>
    );
};
