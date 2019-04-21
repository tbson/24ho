// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import MainForm from '../MainForm';
import OrderForm from '../OrderForm';
import Row from './Row.js';

type CartGroup = {
    shop: {
        nick: string,
        link: string,
        site: string
    },
    items: Array<Object>
};

type Props = {};

export class Service {
    static getCartRequest(): Promise<Object> {
        return Tools.apiCall(apiUrls.shoppingCart).then(resp => {
            if (resp.ok) {
                Service.savedCartItems = resp.data.items;
                Service.savedOrderList = resp.data.orders;
            }
            return resp;
        });
    }

    static syncCartRequest(): Promise<Object> {
        return Tools.apiCall(apiUrls.shoppingCart, Service.cartPayload, 'POST').then(resp => {
            if (resp.ok) {
                Service.savedCartItems = resp.data.items;
                Service.savedOrderList = resp.data.orders;
            }
            return resp;
        });
    }

    static get cartPayload() {
        const payload = {
            items: Service.savedCartItems,
            orders: Service.savedOrderList
        };
        return {shopping_cart: JSON.stringify(payload)};
    }

    static listAddressRequest(): Promise<Object> {
        return Tools.apiCall(apiUrls.addressCrud);
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

    static set savedCartItems(items: Object): Object {
        Tools.setStorage('cart_items', items);

        return items;
    }
    static get savedCartItems(): Object {
        return Tools.getStorageObj('cart_items');
    }

    static set savedOrderList(items: Object): Object {
        Tools.setStorage('orders', items);
        return items;
    }
    static get savedOrderList(): Object {
        return Tools.getStorageObj('orders');
    }

    static recalculate(item: Object): Object {
        item.cny_price = item.quantity * item.cny_unit_price;
        item.vnd_price = item.quantity * item.vnd_unit_price;
        return item;
    }

    static group(items: Array<Object>, orders: Object): Array<CartGroup> {
        const groups = [];
        for (let item of items) {
            const group = groups.find(group => {
                const {nick, link, site} = group.shop;
                return nick === item.shop_nick && link === item.shop_link && site === item.site;
            });
            if (!group) {
                groups.push({
                    shop: {
                        nick: item.shop_nick,
                        link: item.shop_link,
                        site: item.site,
                        note: '',
                        address: 0,
                        address_title: '',
                        quantity: 0,
                        cny_total: 0,
                        vnd_total: 0
                    },
                    items: [item]
                });
            } else {
                group.items.push(item);
            }
        }
        return groups.map(group => {
            group.shop.cny_total = group.items.reduce((total, item) => total + item.cny_price, 0);
            group.shop.vnd_total = group.items.reduce((total, item) => total + item.vnd_price, 0);
            group.shop.quantity = group.items.reduce((total, item) => total + item.quantity, 0);
            const order = orders[group.shop.nick] || {};
            const {note, address, address_title} = order;
            if (note) group.shop.note = note;
            if (address) {
                group.shop.address = address;
                group.shop.address_title = address_title;
            }
            return group;
        });
    }

    static processPostMessage(resp: Object, setList: Function) {
        let items = resp?.data?.data?.extension_products;
        if (items?.length) {
            window.postMessage({type: 'CLEAR_DATA'}, window.location.origin);
            items = items.map(Service.formatCartItem);
            let newItems = Service.merge(Service.savedCartItems, items);
            Service.savedCartItems = newItems;
            setList(ListTools.prepare(newItems));
            Service.syncCartRequest();
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

    static addressesToOptions(list: Array<Object>): Array<Object> {
        return list.map(item => ({value: item.id, label: `${item.uid} - ${item.title}`}));
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [listOrder, setListOrder] = useState({});
    const [listAddress, setListAddress] = useState([]);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false,
        order: false
    });
    const [orderFormOpen, setOrderFormOpen] = useState(false);
    const [formId, setFormId] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});

    const toggleForm = (value: boolean, key: FormOpenKeyType = 'main') => setFormOpen({...formOpen, [key]: value});

    const listAction = ListTools.actions(list);

    const getList = () => {
        const items = Service.savedCartItems;
        setListOrder(Service.savedOrderList);
        setList(ListTools.prepare(items));
    };

    const onChange = (data: TRow, type: string) => {
        toggleForm(false);
        const items = listAction(Service.recalculate(data))[type]();
        Service.savedCartItems = items;
        setList(items);
        Service.syncCartRequest();
    };

    const onOrderChange = (data: Object) => {
        toggleForm(false, 'order');
        Service.savedOrderList = {...Service.savedOrderList, ...data};
        setListOrder(Service.savedOrderList);
        Service.syncCartRequest();
    };

    const onCheck = id => setList(ListTools.checkOne(id, list));

    const onCheckAll = (condition: Object) => () => setList(ListTools.checkAll(list, condition));

    const onRemove = data => {
        const items = listAction(data).remove();
        Service.savedCartItems = items;
        setList(items);
        Service.syncCartRequest();
    };

    const onBulkRemove = (shop_nick: string) => () => {
        const ids = ListTools.getChecked(list.filter(item => item.shop_nick === shop_nick));
        if (!ids.length) return;

        const r = confirm(ListTools.getDeleteMessage(ids.length));
        if (r) {
            const items = listAction({ids}).bulkRemove();
            Service.savedCartItems = items;
            setList(items);
            Service.syncCartRequest();
        }
    };

    const showForm = (id: number) => {
        toggleForm(true);
        setFormId(id);
    };

    const showOrderForm = (id: number) => {
        toggleForm(true, 'order');
        setFormId(id);
    };

    const searchList = (keyword: string) => {
        const originalList = Service.savedCartItems;
        if (!keyword) return setList(originalList);
        const filteredList = originalList.filter(item => {
            const {title, size, color, note, shop_nick} = item;
            return (
                title.includes(keyword) ||
                size.includes(keyword) ||
                color.includes(keyword) ||
                note.includes(keyword) ||
                shop_nick.includes(keyword)
            );
        });
        setList(filteredList);
    };

    const events = Service.events(setList);

    useEffect(() => {
        Service.getCartRequest().then(getList);
        Service.listAddressRequest().then(resp => setListAddress(Service.addressesToOptions(resp.data.items)));
        events.subscribe();
        return () => events.unsubscribe();
    }, []);

    return (
        <div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th colSpan={2}>Sản phẩm</th>
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

                {Service.group(list, listOrder).map((group, groupKey) => (
                    <Group
                        data={group}
                        key={groupKey}
                        showForm={showOrderForm}
                        onBulkRemove={onBulkRemove(group.shop.nick)}
                        onCheckAll={onCheckAll({shop_nick: group.shop.nick})}>
                        {group.items.map((data, key) => (
                            <Row
                                className="table-row"
                                data={data}
                                key={`${groupKey}${key}`}
                                onCheck={onCheck}
                                onRemove={onRemove}
                                showForm={showForm}
                            />
                        ))}
                    </Group>
                ))}
            </table>

            <MainForm
                id={formId}
                listItem={list}
                open={formOpen.main}
                close={() => toggleForm(false)}
                onChange={onChange}>
                <button type="button" className="btn btn-warning" action="close" onClick={() => toggleForm(false)}>
                    <span className="fas fa-times" />
                    &nbsp;Cancel
                </button>
            </MainForm>
            <OrderForm
                id={formId}
                listOrder={listOrder}
                listAddress={listAddress}
                open={formOpen.order}
                close={() => toggleForm(false, 'order')}
                onChange={onOrderChange}>
                <button
                    type="button"
                    className="btn btn-warning"
                    action="close"
                    onClick={() => toggleForm(false, 'order')}>
                    <span className="fas fa-times" />
                    &nbsp;Cancel
                </button>
            </OrderForm>
        </div>
    );
};

type GroupType = {
    data: Object,
    onCheckAll: Function,
    onBulkRemove: Function,
    showForm: Function,
    children: React.Node
};
export const Group = ({data, showForm, onCheckAll, onBulkRemove, children}: Object) => (
    <tbody>
        <tr>
            <td colSpan={99} className="white-bg" />
        </tr>
        <tr>
            <td className="shop-header">
                <span className="fas fa-check green pointer" onClick={onCheckAll} />
            </td>
            <td colSpan={99} className="shop-header">
                <strong>[{data.shop.site}]</strong>
                <span>&nbsp;/&nbsp;</span>
                <a href={data.shop.link} target="_blank">
                    <strong>{data.shop.nick}</strong>
                </a>
            </td>
        </tr>
        {children}
        <tr>
            <td>
                <span className="fas fa-trash-alt text-danger pointer bulk-remove-button" onClick={onBulkRemove} />
            </td>
            <td>
                <button
                    className="btn btn-success"
                    disabled={!data.shop.address}
                    onClick={() => {}}>
                    <span className="fas fa-check" />
                    &nbsp; Tạo đơn
                </button>
            </td>
            <td className="right">
                <strong>{data.shop.quantity}</strong>
            </td>
            <td />
            <td>
                <div className="vnd">
                    <strong>{Tools.numberFormat(data.shop.vnd_total)}</strong>
                </div>
                <div className="cny">
                    <strong>{Tools.numberFormat(data.shop.cny_total)}</strong>
                </div>
            </td>
            <td>
                <div>
                    <strong>Address: </strong>
                    {data.shop.address_title || <em className="red">Chưa có địa chỉ nhận hàng...</em>}
                </div>
                <div>
                    <strong>Note: </strong>
                    {data.shop.note || <em>Chưa có ghi chú...</em>}
                </div>
            </td>
            <td className="right">
                <button className="btn btn-info btn-block" onClick={() => showForm(data.shop.nick)}>
                    <span className="fas fa-edit" />
                    &nbsp; Sửa đơn
                </button>
            </td>
        </tr>
    </tbody>
);
