// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing
import {Button, Collapse} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import ShowWhen from 'src/utils/components/ShowWhen';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import MainForm from '../MainForm';
import {Service as MainFormService} from '../MainForm';
import Row from './Row.js';
import FilterForm from '../FilterForm';

const {Panel} = Collapse;

type Props = {
    readonly?: boolean,
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

export default ({readonly = false, order_id = 0, bol_date_id = 0, bag_id = 0, notifyChange}: Props) => {
    const [list, setList] = useState([]);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false
    });
    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});
    const [options, setOptions] = useState({
        sale: [],
        cust_care: [],
        customer: []
    });

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object = {}) => {
        let composedParams = {...params};
        if (order_id) composedParams = {...composedParams, order_id};
        if (bol_date_id) composedParams = {...composedParams, bol_date_id};
        if (bag_id) composedParams = {...composedParams, bag_id};
        const data = await Service.handleGetList(url, composedParams);
        if (!data) return;
        setList(ListTools.prepare(data.items));
        setOptions(data.extra.options);
        setLinks(data.links);
    };

    const onChange = (data: TRow, type: string, reOpenDialog: boolean) => {
        MainFormService.toggleForm(false);
        setList(listAction(data)[type]());
        notifyChange && notifyChange();
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

    const searchList = (condition: Object) => getList('', condition);
    const handleFilter = (conditions: Object) => {
        searchList(conditions);
    };

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
                        <th scope="col">Ngày</th>
                        <th scope="col">Mã vận đơn / giao dịch</th>
                        <th scope="col">Mã địa chỉ</th>
                        <th scope="col">Bao</th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col" className="right">
                            P.vận Chuyển
                        </th>
                        <th scope="col" className="right">
                            Bảo hiểm
                        </th>
                        <th scope="col" className="right">
                            P.Phí khác
                        </th>
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
                            <ShowWhen value={!readonly}>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon="plus"
                                    onClick={() => MainFormService.toggleForm(true)}>
                                    Thêm
                                </Button>
                            </ShowWhen>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td colSpan="99">
                            <Collapse>
                                <Panel header="Tìm kiếm" key="1">
                                    <FilterForm onChange={handleFilter} options={options} />
                                </Panel>
                            </Collapse>
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
                            showForm={(id, cnDate) => MainFormService.toggleForm(true, id, cnDate)}
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

            <MainForm order_id={order_id} onChange={onChange} />
        </div>
    );
};
