// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import MainForm from '../MainForm';
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

    static prepareList(list: Array<DbRow>, listSale: Array<Object>, listCustCare: Array<Object>): Array<TRow> {
        list = ListTools.prepare(list);
        list = Service.addNameToList(list, listSale, 'sale');
        list = Service.addNameToList(list, listCustCare, 'cust_care');
        return list;
    }

    static prepareItem(item: DbRow, listSale: Array<Object>, listCustCare: Array<Object>): TRow {
        item = {...item, checked: false};
        item = Service.addNameToItem(item, listSale, 'sale');
        item = Service.addNameToItem(item, listCustCare, 'cust_care');
        return item;
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [listSale, setListSale] = useState([]);
    const [listCustCare, setListCustCare] = useState([]);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false
    });
    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});

    const toggleForm = (value: boolean, key: FormOpenKeyType = 'main') => setFormOpen({...formOpen, [key]: value});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object) => {
        const data = await Service.handleGetList(url, params);
        if (!data) return;
        const _listSale = Service.staffToOptions(data.extra.list_sale);
        const _listCustCare = Service.staffToOptions(data.extra.list_cust_care);
        setList(Service.prepareList(data.items, _listSale, _listCustCare));
        setLinks(data.links);
        setListSale(_listSale);
        setListCustCare(_listCustCare);
    };

    const onChange = (data: TRow, type: string, reOpenDialog: boolean) => {
        toggleForm(false);
        setList(listAction(data)[type]());
        reOpenDialog && toggleForm(true);
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

    const showForm = (id: number) => {
        toggleForm(true);
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
                        <th scope="col">Email</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Họ và tên</th>
                        <th scope="col">NV mua hàng</th>
                        <th scope="col">NV chăm sóc</th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            <button className="btn btn-primary btn-sm btn-block add-button" onClick={() => showForm(0)}>
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
                            showForm={showForm}
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
                id={modalId}
                listSale={listSale}
                listCustCare={listCustCare}
                open={formOpen.main}
                close={() => toggleForm(false)}
                onChange={onChange}>
                <button type="button" className="btn btn-light" action="close" onClick={() => toggleForm(false)}>
                    Cancel
                </button>
            </MainForm>
        </div>
    );
};
