// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing
import {Button} from 'antd';
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

    static staffToOptions(staffs: Array<Object>): Array<Object> {
        return staffs.map(item => ({value: item.id, label: item.fullname}));
    }

    static addNameToList(list: Array<Object>, nameSource: Array<Object>, key: string): Array<Object> {
        const map = nameSource.reduce((obj, item) => {
            obj[item.value] = item.label;
            return obj;
        }, {});
        return list.map(item => {
            item[`${key}_name`] = map[item[`${key}`]];
            return item;
        });
    }

    static addNameToItem(item: DbRow, nameSource: Array<Object>, key: string): Object {
        const map = nameSource.reduce((obj, item) => {
            obj[item.value] = item.label;
            return obj;
        }, {});
        item[`${key}_name`] = map[item[`${key}`]];
        return item;
    }

    static prepareList(
        list: Array<DbRow>,
        listSale: Array<Object>,
        listCustCare: Array<Object>,
        listGroup: Array<Object>
    ): Array<TRow> {
        list = ListTools.prepare(list);
        list = Service.addNameToList(list, listSale, 'sale');
        list = Service.addNameToList(list, listCustCare, 'cust_care');
        list = Service.addNameToList(list, listGroup, 'customer_group');
        return list;
    }

    static prepareItem(
        item: DbRow,
        listSale: Array<Object>,
        listCustCare: Array<Object>,
        listGroup: Array<Object>
    ): TRow {
        item = {...item, checked: false};
        item = Service.addNameToItem(item, listSale, 'sale');
        item = Service.addNameToItem(item, listCustCare, 'cust_care');
        item = Service.addNameToItem(item, listGroup, 'customer_group');
        return item;
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [listSale, setListSale] = useState([]);
    const [listCustCare, setListCustCare] = useState([]);
    const [listGroup, setListGroup] = useState([]);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false
    });
    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object) => {
        const data = await Service.handleGetList(url, params);
        if (!data) return;
        const _listSale = data.extra.list_sale || [];
        const _listCustCare = data.extra.list_cust_care || [];
        const _listGroup = data.extra.list_group || [];
        setList(Service.prepareList(data.items, _listSale, _listCustCare, _listGroup));
        setLinks(data.links);
        setListSale(_listSale);
        setListCustCare(_listCustCare);
        setListGroup(_listGroup);
    };

    const onChange = (data: TRow, type: string) => {
        const _data = Service.prepareItem(data, listSale, listCustCare, listGroup);
        setList(listAction(_data)[type]());
        MainFormService.toggleForm(false);
    };

    const onCheck = id => setList(ListTools.checkOne(id, list));

    const onCheckAll = () => setList(ListTools.checkAll(list));

    const onRemove = data => setList(listAction(data).remove());

    const onBulkRemove = () => {
        const ids = ListTools.getChecked(list);
        if (!ids.length) return;

        const r = confirm(ListTools.getConfirmMessage(ids.length));
        r && Service.handleBulkRemove(ids).then(data => setList(listAction(data).bulkRemove()));
    };

    const showForm = (id: number) => {
        MainFormService.toggleForm(true);
        setModalId(id);
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
                        <th scope="col">Nhóm</th>
                        <th scope="col">Email</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Họ và tên</th>
                        <th scope="col">NV mua hàng</th>
                        <th scope="col">NV chăm sóc</th>
                        <th scope="col" className="right">
                            Phí order
                        </th>
                        <th scope="col" className="right">
                            Đ.giá v.chuyển
                        </th>
                        <th scope="col" className="right">
                            Hệ số cọc
                        </th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            <Button type="primary" icon="plus" onClick={() => MainFormService.toggleForm(true)}>
                                Thêm mới
                            </Button>
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

            <MainForm listSale={listSale} listCustCare={listCustCare} listGroup={listGroup} onChange={onChange} />
        </div>
    );
};
