// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing
import { Button } from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import type {SelectOptions} from 'src/utils/helpers/Tools';
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

    static groupToOptions(listGroup: Array<Object>): Array<Object> {
        return listGroup.map(item => ({value: item.id, label: item.name}));
    }

    static groupIdToName(groupIds: Array<number>, groups: SelectOptions): Array<string> {
        return groupIds.map(groupId => {
            const result = groups.find(group => group.value === groupId);
            return result ? result.label : 'Unknown';
        });
    }

    static prepare(items: Array<Object>, groups: SelectOptions): Array<Object> {
        return ListTools.prepare(items).map(item => {
            item.group_names = Service.groupIdToName(item.groups, groups);
            return item;
        });
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [listGroup, setListGroup] = useState([]);
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
        const _listGroup = Service.groupToOptions(data.extra.list_group).filter(item => item.label !== 'Customer');
        setList(Service.prepare(data.items, _listGroup));
        setLinks(data.links);
        setListGroup(_listGroup);
    };

    const onChange = (data: TRow, type: string, reOpenDialog: boolean) => {
        toggleForm(false);
        data.group_names = Service.groupIdToName(data.groups, listGroup);
        setList(listAction(data)[type]());
        reOpenDialog && toggleForm(true);
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
                        <th scope="col">Tên đăng nhập</th>
                        <th scope="col">Họ và tên</th>
                        <th scope="col">NV mua hàng</th>
                        <th scope="col">CSKH</th>
                        <th scope="col">Quyền</th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            <Button type="primary" icon="plus" onClick={() => showForm(0)}>
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
                listGroup={listGroup}
                open={formOpen.main}
                close={() => toggleForm(false)}
                onChange={onChange}>
                <Button icon="close" onClick={() => toggleForm(false)}>
                    Đóng
                </Button>
            </MainForm>
        </div>
    );
};
