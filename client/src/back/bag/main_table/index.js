// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing
import {Button, Icon} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import ShowWhen from 'src/utils/components/ShowWhen';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import MainForm from '../MainForm';
import {Service as MainFormService} from '../MainForm';
import Row from './Row.js';
import {Service as AreaService} from 'src/back/area/';

type Props = {
    readonly?: boolean,
    bol_date: number
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

export default ({readonly = false, bol_date = 0}: Props) => {
    const [list, setList] = useState([]);
    const [listArea, setListArea] = useState([]);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false
    });
    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});

    const toggleForm = (value: boolean, key: FormOpenKeyType = 'main') => setFormOpen({...formOpen, [key]: value});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object) => {
        let composedParams = {...params};
        if (bol_date) composedParams = {...composedParams, bol_date};
        const data = await Service.handleGetList(url, composedParams);
        if (!data) return;
        const _listArea = AreaService.areaToOptions(data.extra.list_area);
        setListArea(_listArea);
        setList(ListTools.prepare(data.items));
        setLinks(data.links);
    };

    const onChange = (data: TRow, type: string) => {
        data = AreaService.prepareItem(data, listArea);
        MainFormService.toggleForm(false);
        setList(listAction(data)[type]());
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

    const searchList = (keyword: string) => getList('', keyword ? {search: keyword} : {});

    useEffect(() => {
        getList();
    }, []);

    return (
        <div>
            <table className="table table-striped no-margin-bottom">
                <thead className="thead-light">
                    <tr>
                        <th className="row25">
                            <ShowWhen value={!readonly}>
                                <Button size="small" icon="check" onClick={onCheckAll} />
                            </ShowWhen>
                        </th>
                        <th scope="col">Mã bao</th>
                        <th scope="col">Vùng</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            <ShowWhen value={!readonly}>
                                <Button type="primary" icon="plus" onClick={() => MainFormService.toggleForm(true)}>
                                    Thêm mới
                                </Button>
                            </ShowWhen>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td colSpan="99"  >
                            <SearchInput onSearch={searchList} />
                        </td>
                    </tr>
                </tbody>

                <tbody>
                    {list.map((data, key) => (
                        <Row
                            readonly={readonly}
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
                            <ShowWhen value={!readonly}>
                                <Button size="small" type="danger" icon="delete" onClick={onBulkRemove} />
                            </ShowWhen>
                        </th>
                        <th className="row25 right" colSpan="99">
                            <Pagination next={links.next} prev={links.previous} onNavigate={getList} />
                        </th>
                    </tr>
                </tfoot>
            </table>

            <MainForm areaOptions={listArea} onChange={onChange} />
        </div>
    );
};
