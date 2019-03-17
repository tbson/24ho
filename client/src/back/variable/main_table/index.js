// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem} from '../_data';
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
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object) => {
        const data = await Service.handleGetList(url, params);
        setList(ListTools.prepare(data.items));
        setLinks(data.links);
    };

    const onChange = (data: TRow, type: string) => {
        setIsFormOpen(false);
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

    const showForm = (id: number) => {
        setIsFormOpen(true);
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
                        <th scope="col">Key</th>
                        <th scope="col">Value</th>
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

            <MainForm id={modalId} open={isFormOpen} close={() => setIsFormOpen(false)} onChange={onChange}>
                <button type="button" className="btn btn-warning" action="close" onClick={() => setIsFormOpen(false)}>
                    <span className="fas fa-times" />
                    &nbsp;Cancel
                </button>
            </MainForm>
        </div>
    );
};
