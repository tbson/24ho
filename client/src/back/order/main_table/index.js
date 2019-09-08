// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import OnlyAdmin from 'src/utils/components/OnlyAdmin';
import Row from './Row.js';
import ApproveForm from '../ApproveForm';
import {Service as ApproveFormService} from '../ApproveForm';
import FilterForm from '../FilterForm';

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

    static processFilterInput(filterInput: Object): Object {
        let values = {...filterInput};
        const created_at = Tools.rangeToCondition('created_at', values.created_at);
        values = Tools.mergeCondition(values, created_at);
        values = Tools.removeEmptyKey(values);
        delete values.created_at;
        return values;
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
        cust_care: []
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

    const onBulkRemove = () => {
        const ids = ListTools.getChecked(list);
        if (!ids.length) return;

        const r = confirm(ListTools.getDeleteMessage(ids.length));
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

    const handleFilter = (rawValue: Object) => {
        searchCondition = Service.processFilterInput(rawValue);
        searchList(searchCondition);
    };

    useEffect(() => {
        getList();
    }, []);

    return (
        <div>
            <OnlyAdmin>
                <BulkApprove status={status} onApprove={onApprove} />
            </OnlyAdmin>
            <div>
                <FilterForm onChange={handleFilter} />
            </div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th className="row25">
                            <span className="fas fa-check text-info pointer check-all-button" onClick={onCheckAll} />
                        </th>
                        <th scope="col">Thông tin đơn hàng</th>
                        <th scope="col">Nhân viên</th>
                        <th scope="col">Thông tin tài chính</th>
                        <th scope="col" style={{padding: 8}} className="row80" />
                    </tr>
                </thead>

                {/*
                <tbody>
                    <tr>
                        <td colSpan="99" style={{padding: 15, paddingBottom: 0}}>
                            <SearchInput onSearch={searchList} />
                        </td>
                    </tr>
                </tbody>
                */}

                <tbody>
                    {list.map((data, key) => (
                        <Row
                            className="table-row"
                            options={options}
                            data={data}
                            key={data.id}
                            onCheck={onCheck}
                            onRemove={onRemove}
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

            <ApproveForm
                listSale={options.sale}
                close={() => ApproveFormService.toggleForm(false)}
                onChange={onSelectSale}>
                <button
                    type="button"
                    className="btn btn-light"
                    action="close"
                    onClick={() => ApproveFormService.toggleForm(false)}>
                    Cancel
                </button>
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
        <div>
            <button type="button" className="btn btn-success" onClick={onApprove}>
                <i className="fas fa-check" />
                &nbsp;&nbsp;
                <span>Duyệt đơn</span>
            </button>
        </div>
    ) : null;
