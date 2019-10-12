// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing
import {Button, Collapse} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import OnlyAdmin from 'src/utils/components/OnlyAdmin';
import Row from './Row.js';
import ApproveForm from '../ApproveForm';
import {Service as ApproveFormService} from '../ApproveForm';
import FilterForm from '../FilterForm';

const {Panel} = Collapse;

export class Service {
    static listRequest(url?: string, params?: Object): Promise<Object> {
        return Tools.apiCall(url ? url : apiUrls.crud, params);
    }

    static bulkRemoveRequest(ids: Array<number>): Promise<Object> {
        return Tools.apiCall(apiUrls.crud, {ids: ids.join(',')}, 'DELETE');
    }

    static bulkApproveRequest(ids: Array<number>, sale: number): Promise<Object> {
        return Tools.apiCall(apiUrls.bulk_approve, {ids, sale}, 'PUT');
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

    static handleBulkApprove(ids: Array<number>, sale: number): Promise<Object> {
        return Service.bulkApproveRequest(ids, sale)
            .then(resp => (resp.ok ? {ids} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }

    static prepareOptions(options: Object): Object {
        for (const key in options) {
            options[key] = options[key].map(item => ({
                value: item.id,
                label: item.fullname
            }));
        }
        return options;
    }
}

type Props = {
    status: number,
    pending?: boolean
};
export default ({status, pending = false}: Props) => {
    const [list, setList] = useState([]);
    const [options, setOptions] = useState({
        sale: [],
        cust_care: [],
        customer: []
    });

    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});
    let searchCondition = {};

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object) => {
        let _params = {...params, pending};
        if (status) _params = {..._params, status};
        const data = await Service.handleGetList(url, _params);
        if (!data) return;
        setList(ListTools.prepare(data.items));
        setOptions(data.extra.options);
        setLinks(data.links);
    };

    const onCheck = id => setList(ListTools.checkOne(id, list));

    const onCheckAll = () => setList(ListTools.checkAll(list));

    const onRemove = data => setList(listAction(data).remove());

    const onDiscard = data => {
        setList(listAction(data).update());
    };

    const onBulkRemove = () => {
        const ids = ListTools.getChecked(list);
        if (!ids.length) return;

        const r = confirm(ListTools.getConfirmMessage(ids.length));
        r && Service.handleBulkRemove(ids).then(data => setList(listAction(data).bulkRemove()));
    };

    const searchList = (condition: Object) => getList('', condition);

    const onSelectSale = (sale: number) => {
        const ids = ListTools.getChecked(list);
        Service.handleBulkApprove(ids, sale)
            .then(data => {
                Tools.popMessage(`Duyệt ${data.ids.length} đơn thành công.`);
                ApproveFormService.toggleForm(false);
                return data;
            })
            .then(data => setList(listAction(data).bulkRemove()));
    };

    const onApprove = () => {
        const ids = ListTools.getChecked(list);
        if (!ids.length) return;
        ApproveFormService.toggleForm(true);
    };

    const handleFilter = (conditions: Object) => {
        searchList(conditions);
    };

    useEffect(() => {
        getList();
    }, []);

    return (
        <div>
            <OnlyAdmin>
                <BulkApprove status={status} onApprove={onApprove} />
            </OnlyAdmin>

            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th className="row25">
                            <Button size="small" icon="check" onClick={onCheckAll} />
                        </th>
                        <th scope="col">Thông tin đơn hàng</th>
                        <th scope="col">Nhân viên</th>
                        <th scope="col">Thông tin tài chính</th>
                        <th scope="col" style={{padding: 8}} className="row80" />
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
                            className="table-row"
                            options={options}
                            data={data}
                            key={data.id}
                            onCheck={onCheck}
                            onRemove={onRemove}
                            onDiscard={onDiscard}
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

            <ApproveForm
                listSale={options.sale}
                close={() => ApproveFormService.toggleForm(false)}
                onChange={onSelectSale}>
                <Button icon="close" onClick={() => ApproveFormService.toggleForm(false)}>
                    Cancel
                </Button>
            </ApproveForm>
        </div>
    );
};

type BulkApproveType = {
    status: number,
    onApprove: Function
};
const BulkApprove = ({status, onApprove}: BulkApproveType) =>
    status === 1 ? (
        <div style={{paddingLeft: 15}}>
            <Button type="primary" icon="check" onClick={onApprove}>
                Duyệt đơn
            </Button>
        </div>
    ) : null;
