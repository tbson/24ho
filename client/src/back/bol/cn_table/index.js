// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing
import {Button} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import CNForm from '../CNForm';
import {Service as CNFormService} from '../CNForm.js';
import GetOrCreateForm from 'src/back/bag/GetOrCreateForm';
import {Service as GetOrCreateService} from 'src/back/bag/GetOrCreateForm';
import Row from './Row.js';
import UploadExcelButton from './UploadExcelButton';

type Props = {
    history: Object
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

const Component = ({history}: Props) => {
    const [list, setList] = useState([]);
    const [listBag, setListBag] = useState([]);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false
    });
    const [links, setLinks] = useState({next: '', previous: ''});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object) => {
        const data = await Service.handleGetList(url, {...params, cn_date__isnull: false});
        if (!data) return;
        setList(ListTools.prepare(data.items));
        setListBag(data.extra.bags.map(item => ({value: item.id, label: item.uid})));
        setLinks(data.links);
    };

    const onChange = (data: TRow, type: string) => {
        CNFormService.toggleForm(false);
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

    const onEdit = (id: number) => {
        CNFormService.toggleForm(true, id);
    };

    const searchList = (keyword: string) => getList('', keyword ? {search: keyword} : {});

    const bagSelectHandle = ({bag}) => {
        if (!bag) return;
        GetOrCreateService.toggleForm(false);
        setTimeout(() => {
            Tools.navigateTo(history)(`/bol-cn-adding/${bag}`);
        }, 200);
    };

    useEffect(() => {
        getList();
    }, []);

    function toggleSelectBagModal() {
        GetOrCreateService.toggleForm(true);
    }

    return (
        <div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th className="row25">
                            <Button size="small" icon="check" onClick={onCheckAll} />
                        </th>
                        <th scope="col">Ngày</th>
                        <th scope="col">Mã vận đơn</th>
                        <th scope="col">Mã địa chỉ</th>
                        <th scope="col">Bao hàng</th>
                        <th scope="col" className="right">
                            Khối lượng
                        </th>
                        <th scope="col" className="right">
                            Dài / Rộng / Cao
                        </th>
                        <th scope="col" className="right">
                            Số kiện
                        </th>
                        <th scope="col">Ghi chú</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            <Button type="primary" size="small" icon="plus" onClick={toggleSelectBagModal}>
                                Thêm
                            </Button>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td colSpan="99">
                            <SearchInput onSearch={searchList} />
                        </td>
                    </tr>
                </tbody>

                <tbody>
                    {list.map((data, key) => (
                        <Row
                            className="table-row"
                            listBag={listBag}
                            item={data}
                            key={key}
                            onCheck={onCheck}
                            onRemove={onRemove}
                            onEdit={onEdit}
                        />
                    ))}
                </tbody>

                <tfoot className="thead-light">
                    <tr>
                        <th className="row25">
                            <Button size="small" type="danger" icon="delete" onClick={onBulkRemove} />
                        </th>
                        <th><UploadExcelButton onChange={() => getList()}/></th>
                        <th className="row25 right" colSpan="99">
                            <Pagination next={links.next} prev={links.previous} onNavigate={getList} />
                        </th>
                    </tr>
                </tfoot>
            </table>

            <GetOrCreateForm onChange={bagSelectHandle} />
            <CNForm onChange={onChange} />
        </div>
    );
};

export default withRouter(Component);
