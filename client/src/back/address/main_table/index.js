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
import {Service as AreaService} from 'src/back/area/';

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
    const [listArea, setListArea] = useState([]);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false
    });
    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object) => {
        const data = await Service.handleGetList(url, params);
        if (!data) return;
        const _listArea = AreaService.areaToOptions(data.extra.list_area);
        setListArea(_listArea);
        setList(AreaService.prepareList(data.items, _listArea));
        setLinks(data.links);
    };

    const onChange = (data: TRow, type: string) => {
        MainFormService.toggleForm(false);
        data = AreaService.prepareItem(data, listArea);
        let newList = [...list];
        if (data.default) newList = list.map(item => ({...item, default: false}));
        setList(listAction(data)[type](newList));
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
                            <Button size="small" icon="check" onClick={onCheckAll} />
                        </th>
                        <th scope="col">Vùng</th>
                        <th scope="col">Mã vùng</th>
                        <th scope="col">Địa chỉ</th>
                        <th scope="col">Số điện thoại</th>
                        <th scope="col">Họ và tên</th>
                        <th scope="col">Mặc định</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            <Button type="primary" icon="plus" onClick={() => MainFormService.toggleForm(true)}>
                                Thêm
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
                            <Button size="small" type="danger" icon="delete" onClick={onBulkRemove} />
                        </th>
                        <th className="row25 right" colSpan="99">
                            <Pagination next={links.next} prev={links.previous} onNavigate={getList} />
                        </th>
                    </tr>
                </tfoot>
            </table>
            <MainForm listArea={listArea} onChange={onChange} />
        </div>
    );
};
