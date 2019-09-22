// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing
import {Button} from 'antd';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls, listTypeSelect, listMoneyTypeSelect} from '../_data';
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

    static objToOptions(obj: Object): SelectOptions {
        return Object.entries(obj).map(([value, label]) => ({
            value: parseInt(value),
            label: `${value} - ${String(label)}`
        }));
    }

    static getBankOptions(list: Array<Object>): SelectOptions {
        return list.map(({id, uid, title}) => ({value: id, label: `${uid} - ${title}`}));
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [listCustomer, setListCustomer] = useState([]);
    const [listBank, setListBank] = useState([]);
    const [balance, setBalance] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});
    const [totalStatistics, setTotalStatistics] = useState({
        income: 0,
        outcome: 0,
        missing: 0,
        balance: 0
    });

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
        listBank.length || setListBank(data.extra.list_bank || []);
        setBalance(data.extra.balance || 0);
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
        if (Tools.isAdmin()) Tools.apiClient(apiUrls.totalStatistics).then(setTotalStatistics);
    }, []);

    return (
        <div>
            {!Tools.isAdmin() && (
                <div style={{margin: 10}}>
                    <span>Số dư: </span>
                    <strong className="vnd">{Tools.numberFormat(balance)}</strong>
                </div>
            )}
            {Tools.isAdmin() && (
                <div style={{margin: 10}}>
                    <span>Tổng thu: </span>
                    <strong className="vnd">{Tools.numberFormat(totalStatistics.income)}</strong>
                    <span>&nbsp;|&nbsp;</span>
                    <span>Tổng chi: </span>
                    <strong className="vnd">{Tools.numberFormat(totalStatistics.outcome)}</strong>
                    <span>&nbsp;|&nbsp;</span>
                    <span>Còn thiếu: </span>
                    <strong className="vnd">{Tools.numberFormat(totalStatistics.missing)}</strong>
                    <span>&nbsp;|&nbsp;</span>
                    <span>Số dư ví khách: </span>
                    <strong className="vnd">{Tools.numberFormat(totalStatistics.balance)}</strong>
                </div>
            )}
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        {Tools.isAdmin() && (
                            <th className="row25">
                                <span
                                    className="fas fa-check text-info pointer check-all-button"
                                    onClick={onCheckAll}
                                />
                            </th>
                        )}
                        <th scope="col">Ngày</th>
                        <th scope="col">Mã giao dịch</th>
                        <th scope="col">Loại giao dịch</th>
                        <th scope="col" className="right">
                            Ghi có
                        </th>
                        <th scope="col" className="right">
                            Ghi nợ
                        </th>
                        <th scope="col" className="right">
                            Số dư
                        </th>
                        <th scope="col">Loại tiền</th>
                        {Tools.isAdmin() && <th scope="col">Nhân viên</th>}
                        {Tools.isAdmin() && <th scope="col">Khách hàng</th>}
                        <th scope="col">Ghi chú</th>
                        {Tools.isAdmin() && (
                            <th scope="col" style={{padding: 8}} className="row80">
                                <Button type="primary" icon="plus" onClick={() => MainFormService.toggleForm(true)}>
                                    Thêm mới
                                </Button>
                            </th>
                        )}
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
                        {Tools.isAdmin() && (
                            <th className="row25">
                                <span
                                    className="fas fa-trash-alt text-danger pointer bulk-remove-button"
                                    onClick={onBulkRemove}
                                />
                            </th>
                        )}
                        <th className="row25 right" colSpan="99">
                            <Pagination next={links.next} prev={links.previous} onNavigate={getList} />
                        </th>
                    </tr>
                </tfoot>
            </table>

            <MainForm
                listCustomer={listCustomer}
                listBank={Service.getBankOptions(listBank)}
                listType={Service.objToOptions(listTypeSelect)}
                listMoneyType={Service.objToOptions(listMoneyTypeSelect)}
                close={() => MainFormService.toggleForm(false)}
                onChange={onChange}>
                <Button icon="close" onClick={() => MainFormService.toggleForm(false)}>
                    Thoát
                </Button>
            </MainForm>
        </div>
    );
};
