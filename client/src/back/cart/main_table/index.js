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
    static bulkRemoveRequest(ids: Array<number>): Promise<Object> {
        return Tools.apiCall(apiUrls.crud, {ids: ids.join(',')}, 'DELETE');
    }

    static handleBulkRemove(ids: Array<number>): Promise<Object> {
        return Service.bulkRemoveRequest(ids)
            .then(resp => (resp.ok ? {ids} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }

    static formatCartItem(item: Object, index: number): Object {
        const colortxt = item.colortxt;
        const sizetxt = item.sizetxt;

        const rate = item.rate;
        const quantity = item.amount;

        const cny_unit_price = item.price;
        const vnd_unit_price = cny_unit_price * rate;

        const cny_price = cny_unit_price * quantity;
        const vnd_price = vnd_unit_price * quantity;

        return {
            id: index + 1,
            site: item.site,
            title: item.name.trim(),
            color: colortxt ? colortxt.trim() : '',
            size: sizetxt ? sizetxt.trim() : '',
            link: item.pro_link,
            image: item.image,
            shop_link: item.shop_link,
            shop_nick: item.shop_nick,
            note: '',
            rate,
            quantity,
            cny_unit_price,
            vnd_unit_price,
            cny_price,
            vnd_price
        };
    }

    static recalculate(item: Object): Object {
        item.cny_price = item.quantity * item.cny_unit_price;
        item.vnd_price = item.quantity * item.vnd_unit_price;
        return item;
    }

    static processPostMessage(resp: Object, setList: Function) {
        let items = resp?.data?.data?.extension_products;
        if (items?.length) {
            window.postMessage({type: 'CLEAR_DATA'}, window.location.origin);
            items = items.map(Service.formatCartItem);
            let newItems = Service.merge(Tools.getStorageObj('cart_items'), items);
            Tools.setStorage('cart_items', newItems);
            setList(ListTools.prepare(newItems));
        }
    }

    static merge(oldItems: Array<Object>, newItems: Array<Object>): Array<Object> {
        const realNewItems = [];
        const lastOldId = oldItems.reduce((lastId, item) => (item.id > lastId ? item.id : lastId), 0);
        let lastId = lastOldId + 1;
        for (const newItem of newItems) {
            const index = oldItems.findIndex(
                item => item.title === newItem.title && item.size === newItem.size && item.color === newItem.color
            );
            if (index === -1) {
                realNewItems.push({...newItem, id: lastId});
                lastId++;
            } else {
                oldItems[index].quantity += newItem.quantity;
            }
        }
        return [...oldItems, ...realNewItems];
    }

    static requestData() {
        window.postMessage({type: 'REQUEST_DATA'}, window.location.origin);
    }

    static onVisibilityChange() {
        const {hidden} = Tools.visibilityChangeParams();
        window.document[hidden] || Service.requestData();
    }

    static onMessage(setList: Function) {
        return (resp: Object) => Service.processPostMessage(resp, setList);
    }

    static events(setList: Function) {
        const {visibilityChange} = Tools.visibilityChangeParams();
        const onMessage = Service.onMessage(setList);
        return {
            subscribe: () => {
                document.addEventListener(visibilityChange, Service.onVisibilityChange, false);
                window.addEventListener('message', onMessage);
            },
            unsubscribe: () => {
                document.removeEventListener(visibilityChange, Service.onVisibilityChange, false);
                window.removeEventListener('message', onMessage);
            }
        };
    }

    static checkNewItem(list: ListItem, item: DbRow): Object {
        return {};
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [modalId, setModalId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});

    const listAction = ListTools.actions(list);

    const getList = () => {
        setList(ListTools.prepare(Tools.getStorageObj('cart_items')));
    };

    const onChange = (data: TRow, type: string, reOpenDialog: boolean) => {
        setIsFormOpen(false);
        const items = listAction(Service.recalculate(data))[type]();
        Tools.setStorage('cart_items', items);
        setList(items);
        reOpenDialog && setIsFormOpen(true);
    };

    const onCheck = id => setList(ListTools.checkOne(id, list));

    const onCheckAll = () => setList(ListTools.checkAll(list));

    const onRemove = data => {
        const items = listAction(data).remove();
        Tools.setStorage('cart_items', items);
        setList(items);
    };

    const onBulkRemove = () => {
        const ids = ListTools.getChecked(list);
        if (!ids.length) return;

        const r = confirm(ListTools.getDeleteMessage(ids.length));
        if (r) {
            const items = listAction({ids}).bulkRemove();
            Tools.setStorage('cart_items', items);
            setList(items);
        }
    };

    const showForm = (id: number) => {
        setIsFormOpen(true);
        setModalId(id);
    };

    const searchList = (keyword: string) => {};

    const events = Service.events(setList);

    useEffect(() => {
        events.subscribe();
        getList();
        return () => events.unsubscribe();
    }, []);

    return (
        <div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th className="row25">
                            <span className="fas fa-check text-info pointer check-all-button" onClick={onCheckAll} />
                        </th>
                        <th scope="col">Sản phẩm</th>
                        <th scope="col">Số lượng</th>
                        <th scope="col" className="right">
                            Đơn giá
                        </th>
                        <th scope="col" className="right">
                            Tiền hàng
                        </th>
                        <th scope="col">Ghi chú</th>
                        <th scope="col" style={{padding: 8}} className="row80">
                            {/*
                            <button className="btn btn-primary btn-sm btn-block add-button" onClick={() => showForm(0)}>
                                <span className="fas fa-plus" />
                                &nbsp; Add
                            </button>
                            */}
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
                listItem={list}
                open={isFormOpen}
                close={() => setIsFormOpen(false)}
                onChange={onChange}>
                <button type="button" className="btn btn-warning" action="close" onClick={() => setIsFormOpen(false)}>
                    <span className="fas fa-times" />
                    &nbsp;Cancel
                </button>
            </MainForm>
        </div>
    );
};
