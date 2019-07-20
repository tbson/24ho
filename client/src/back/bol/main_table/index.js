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

type Props = {
    order_id?: number,
    bag_id?: number,
    bol_date_id?: number,
    notifyChange?: Function
};

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
}

export default ({order_id = 0, bol_date_id = 0, bag_id = 0, notifyChange}: Props) => {
    const [list, setList] = useState([]);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false
    });
    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});

    const toggleForm = (value: boolean, key: FormOpenKeyType = 'main') => setFormOpen({...formOpen, [key]: value});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object = {}) => {
        let composedParams = {...params};
        if (order_id) composedParams = {...composedParams, order_id};
        if (bol_date_id) composedParams = {...composedParams, bol_date_id};
        if (bag_id) composedParams = {...composedParams, bag_id};
        const data = await Service.handleGetList(url, composedParams);
        if (!data) return;
        setList(ListTools.prepare(data.items));
        setLinks(data.links);
    };

    const onChange = (data: TRow, type: string, reOpenDialog: boolean) => {
        toggleForm(false);
        setList(listAction(data)[type]());
        reOpenDialog && toggleForm(true);
        notifyChange && notifyChange();
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
        console.log(bag_id);
        getList();
    }, []);

    return (
        <div>
            <table className="table table-striped no-margin-bottom">
                <thead className="thead-light">
                    <tr>
                        <th className="row25">
                            <span className="fas fa-check text-info pointer check-all-button" onClick={onCheckAll} />
                        </th>
                        <th scope="col">Ngày</th>
                        <th scope="col">Mã vận đơn</th>
                        <th scope="col">Bao</th>
                        <th scope="col">TQ</th>
                        <th scope="col">VN</th>
                        <th scope="col" className="right">
                            Khối lượng
                        </th>
                        <th scope="col" className="right">
                            Dài
                        </th>
                        <th scope="col" className="right">
                            Rộng
                        </th>
                        <th scope="col" className="right">
                            Cao
                        </th>
                        <th scope="col" className="right">
                            Số kiện
                        </th>
                        <th scope="col">Bảo hiểm</th>
                        <th scope="col">Ghi chú</th>
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

            <MainForm id={modalId} open={formOpen.main} close={() => toggleForm(false)} onChange={onChange}>
                <button type="button" className="btn btn-light" action="close" onClick={() => toggleForm(false)}>
                    Cancel
                </button>
            </MainForm>
        </div>
    );
};
