// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from 'src/back/order/_data';
import {SearchInput} from 'src/utils/components/TableUtils';
import Row from './Row.js';

export class Service {
    static listRequest(params: Object = {}): Promise<Object> {
        return Tools.apiCall(apiUrls.orderItemCrud, params);
    }

    static bulkRemoveRequest(ids: Array<number>): Promise<Object> {
        return Tools.apiCall(apiUrls.orderItemCrud, {ids: ids.join(',')}, 'DELETE');
    }

    static handleGetList(params: Object = {}): Promise<Object> {
        return Service.listRequest(params)
            .then(resp => (resp.ok ? resp.data || {} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }

    static handleBulkRemove(ids: Array<number>): Promise<Object> {
        return Service.bulkRemoveRequest(ids)
            .then(resp => (resp.ok ? {ids} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }
}

type Props = {
    pending: boolean,
    order_id: number,
    rate: number,
    notifyChange: Function
};
export default ({pending = false, order_id, rate, notifyChange}: Props) => {
    const [list, setList] = useState([]);

    const listAction = ListTools.actions(list);

    const getList = async (params?: Object) => {
        const _params = {...params, order_id};
        const data = await Service.handleGetList(_params);
        if (!data) return;
        const items = data.items.map(item => {
            item.rate = rate;
            return item;
        });
        setList(ListTools.prepare(items));
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

    const searchList = (keyword: string) => getList(keyword ? {search: keyword} : {});

    const partialChangeHandle = data => {
        setList(listAction(data)['update']());
        notifyChange();
    };

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
                        <th>Sản phẩm</th>
                        <th className="right">Số lượng</th>
                        <th className="right">Đơn giá</th>
                        <th className="right">Tiền hàng</th>
                        <th>Ghi chú</th>
                        <th className="row80" />
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
                            pending={pending}
                            data={data}
                            key={key}
                            onCheck={onCheck}
                            onRemove={onRemove}
                            onPartialChange={partialChangeHandle}
                        />
                    ))}
                </tbody>

                <tfoot className="thead-light">
                    <tr>
                        <th className="row25">
                            {pending || (
                                <span
                                    className="fas fa-trash-alt text-danger pointer bulk-remove-button"
                                    onClick={onBulkRemove}
                                />
                            )}
                        </th>
                        <th className="row25 right" colSpan="99" />
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};
