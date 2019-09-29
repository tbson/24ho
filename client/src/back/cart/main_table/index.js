// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput, BoolOutput} from 'src/utils/components/TableUtils';
import MainForm from '../MainForm';
import OrderForm from '../OrderForm';
import Row from './Row.js';

type CartGroup = {
    order: {
        shop_nick: string,
        shop_link: string,
        site: string
    },
    items: Array<Object>
};

type CartGroupPayload = {
    order: string,
    items: string
};

type Props = {};

export class Service {
    static getCartRequest(): Promise<Object> {
        return Tools.apiCall(apiUrls.shoppingCart).then(resp => {
            if (resp.ok) {
                Service.savedCartItems = resp.data.items || [];
                Service.savedOrderList = resp.data.orders || {};
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

    static sendCartRequest(payload: CartGroupPayload): Promise<Object> {
        return Tools.apiCall(apiUrls.orderCrud, payload, 'POST');
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
        const real_rate = item.real_rate;
        const quantity = item.amount;

        const unit_price = item.price;

        return {
            id: index + 1,
            site: item.site,
            title: item.name.trim(),
            color: colortxt ? colortxt.trim() : '',
            size: sizetxt ? sizetxt.trim() : '',
            url: item.pro_link,
            image: item.image,
            shop_link: item.shop_link,
            shop_nick: item.shop_nick,
            note: item.note || '',
            rate,
            real_rate,
            quantity,
            unit_price
        };
    }

    static set savedCartItems(items: Object): Object {
        Tools.setStorage('cart_items', items);

        return items;
    }
    static get savedCartItems(): Array<Object> {
        const result = Tools.getStorageObj('cart_items');
        return Tools.isEmpty(result) ? [] : result;
    }

    static set savedOrderList(items: Object): Object {
        Tools.setStorage('orders', items);
        return items;
    }
    static get savedOrderList(): Object {
        return Tools.getStorageObj('orders') || {};
    }

    static calculate(items: Array<Object>): Array<Object> {
        const rate = items.reduce((result, item) => (item.rate > result ? item.rate : result), 0);
        const realRate = items.reduce((result, item) => (item.real_rate > result ? item.real_rate : result), 0);
        return items.map(item => {
            item.rate = rate;
            item.real_rate = realRate;

            item.cny_unit_price = item.unit_price;
            item.vnd_unit_price = item.unit_price * rate;

            item.cny_price = item.quantity * item.cny_unit_price;
            item.vnd_price = item.cny_price * rate;

            return item;
        });
    }

    static group(items: Array<Object>, orders: Object): Array<CartGroup> {
        const groups = [];
        for (let item of Service.calculate(items)) {
            const group = groups.find(group => {
                const {shop_link, shop_nick, site} = group.order;
                return shop_link === item.shop_link && shop_nick === item.shop_nick && site === item.site;
            });
            const _item = {...item};
            delete _item.real_rate;
            delete _item.cny_unit_price;
            delete _item.vnd_unit_price;
            delete _item.shop_link;
            delete _item.shop_nick;
            delete _item.site;
            if (!group) {
                groups.push({
                    order: {
                        shop_nick: item.shop_nick,
                        shop_link: item.shop_link,
                        site: item.site,
                        note: '',
                        count_check: false,
                        wooden_box: false,
                        shockproof: false,
                        address: 0,
                        address_title: '',
                        rate: item.rate,
                        real_rate: item.real_rate,
                        quantity: 0,
                        cny_total: 0,
                        vnd_total: 0
                    },
                    items: [_item]
                });
            } else {
                group.items.push(_item);
            }
        }
        return groups.map(group => {
            group.order.cny_total = parseFloat(
                group.items.reduce((total, item) => total + item.cny_price, 0).toFixed(3)
            );
            group.order.vnd_total = parseInt(group.items.reduce((total, item) => total + item.vnd_price, 0));
            group.order.quantity = parseInt(group.items.reduce((total, item) => total + item.quantity, 0));
            const order = orders[group.order.shop_nick] || {};
            const {note, address, address_title, count_check, wooden_box, shockproof} = order;
            if (note) group.order.note = note;
            if (address) {
                group.order.address = address;
                group.order.address_title = address_title;
            }
            group.order.count_check = count_check || false;
            group.order.wooden_box = wooden_box || false;
            group.order.shockproof = shockproof || false;
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
                if (newItem.note) oldItems[index].note = newItem.note;
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
        if (!list) return [];
        return list.map(item => ({value: item.id, label: `${item.uid} - ${item.title}`}));
    }

    static extractShopList(items: Array<Object>): Array<string> {
        const uniqueItems = new Set(items.map(item => item.shop_nick));
        return Array.from(uniqueItems);
    }

    static updateSavedOrderList(listItem: Array<Object>, listOrder: Object): Object {
        const shopList = Service.extractShopList(listItem);
        for (let key in listOrder) {
            if (!shopList.includes(key)) delete listOrder[key];
        }
        return listOrder;
    }
}

export default ({}: Props) => {
    const defaultRate = 3600;
    const [list, setList] = useState([]);
    const [listOrder, setListOrder] = useState({});
    const [listAddress, setListAddress] = useState([]);
    const [defaultAddress, setDefaultAddress] = useState(0);
    const [rate, setRate] = useState(defaultRate);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false,
        order: false
    });
    const [orderFormOpen, setOrderFormOpen] = useState(false);
    const [formId, setFormId] = useState(0);
    const [amount, setAmount] = useState(0);
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
        const items = listAction(data)[type]();
        Service.savedCartItems = items;
        setList(items);
        Service.syncCartRequest();
    };

    const onOrderChange = (data: Object) => {
        toggleForm(false, 'order');
        Service.savedOrderList = {...Service.savedOrderList, ...data};
        setListOrder(Service.savedOrderList);
        return Service.syncCartRequest().then(() => [Object.keys(data)[0], Service.savedOrderList]);
    };

    const onCheck = id => setList(ListTools.checkOne(id, list));

    const onCheckAll = (condition: Object) => () => setList(ListTools.checkAll(list, condition));

    const onRemove = data => {
        const items = listAction(data).remove();
        Service.savedCartItems = items;
        Service.savedOrderList = Service.updateSavedOrderList(items, Service.savedOrderList);
        setList(items);
        setListOrder(Service.savedOrderList);
        Service.syncCartRequest();
    };

    const removeItemsAndSave = (ids: Array<number>) => {
        const items = listAction({ids}).bulkRemove();
        Service.savedCartItems = items;
        Service.savedOrderList = Service.updateSavedOrderList(items, Service.savedOrderList);
        setList(items);
        setListOrder(Service.savedOrderList);
        Service.syncCartRequest();
    };

    const onBulkRemove = (shop_nick: string) => () => {
        const ids = ListTools.getChecked(list.filter(item => item.shop_nick === shop_nick));
        if (!ids.length) return;

        const r = confirm(ListTools.getConfirmMessage(ids.length));
        r && removeItemsAndSave(ids);
    };

    const showForm = (id: number) => {
        toggleForm(true);
        setFormId(id);
    };

    const showOrderForm = (id: number, _amount: number) => {
        toggleForm(true, 'order');
        setFormId(id);
        setAmount(_amount);
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

    const sendOrder = (data: Object) => {
        const payload = {
            order: JSON.stringify(data.order),
            items: JSON.stringify(data.items)
        };
        Service.sendCartRequest(payload).then(resp => {
            if (resp.ok) {
                const ids = list
                    .filter(item => {
                        return item.shop_nick === data.order.shop_nick;
                    })
                    .map(item => item.id);
                removeItemsAndSave(ids);
                Tools.popMessage('Order created successfully!');
            } else {
                Tools.popMessage('Can not create order.', 'error');
            }
        });
    };

    const events = Service.events(setList);

    useEffect(() => {
        Tools.apiClient(apiUrls.rateLatest).then(data => {
            setRate(data.value || defaultRate);
        });
        Service.getCartRequest()
            .then(getList)
            .then(Service.requestData);
        Service.listAddressRequest().then(resp => {
            const _defaultAddress = resp.data.items.find(item => item.default);
            setDefaultAddress(_defaultAddress ? _defaultAddress.id : 0);
            setListAddress(Service.addressesToOptions(resp.data.items));
        });
        events.subscribe();
        return () => events.unsubscribe();
    }, []);

    const groups = Service.group(list, listOrder);

    const getGroupByShopNick = (shop_nick: string, listOrder: Object): Object => {
        const result = Service.group(list, listOrder).find(item => item.order.shop_nick === shop_nick);
        return result;
    };
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

                {groups.length ? (
                    groups.map((group, groupKey) => (
                        <Group
                            data={group}
                            key={groupKey}
                            sendOrder={sendOrder}
                            showForm={showOrderForm}
                            onBulkRemove={onBulkRemove(group.order.shop_nick)}
                            onCheckAll={onCheckAll({shop_nick: group.order.shop_nick})}>
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
                    ))
                ) : (
                    <tbody>
                        <tr>
                            <td colSpan={99}>Không có sản phẩm nào.</td>
                        </tr>
                    </tbody>
                )}
            </table>

            <MainForm
                id={formId}
                listItem={list}
                open={formOpen.main}
                close={() => toggleForm(false)}
                onChange={onChange}>
                <button type="button" className="btn btn-light" action="close" onClick={() => toggleForm(false)}>
                    Cancel
                </button>
            </MainForm>
            <OrderForm
                id={formId}
                rate={rate}
                amount={amount}
                listOrder={listOrder}
                defaultAddress={defaultAddress}
                listAddress={listAddress}
                open={formOpen.order}
                close={() => toggleForm(false, 'order')}
                onChange={data =>
                    onOrderChange(data).then(([shop_nick, listOrder]) =>
                        sendOrder(getGroupByShopNick(shop_nick, listOrder))
                    )
                }>
                <button
                    type="button"
                    className="btn btn-light"
                    action="close"
                    onClick={() => toggleForm(false, 'order')}>
                    Cancel
                </button>
            </OrderForm>
        </div>
    );
};

type GroupType = {
    data: Object,
    sendOrder: Function,
    onCheckAll: Function,
    onBulkRemove: Function,
    showForm: Function,
    children: React.Node
};
export const Group = ({data, sendOrder, showForm, onCheckAll, onBulkRemove, children}: Object) => (
    <tbody>
        <tr>
            <td colSpan={99} className="white-bg" />
        </tr>
        <tr>
            <td className="order-header">
                <span className="fas fa-check green pointer" onClick={onCheckAll} />
            </td>
            <td colSpan={99} className="order-header">
                <strong>[{data.order.site}]</strong>
                <span>&nbsp;/&nbsp;</span>
                <a href={data.order.shop_link} target="_blank">
                    <strong>{data.order.shop_nick}</strong>
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
                    type="button"
                    onClick={() => showForm(data.order.shop_nick, data.order.vnd_total)}>
                    <span className="fas fa-check" />
                    &nbsp; Tạo đơn
                </button>
            </td>
            <td className="right mono">
                <strong>{data.order.quantity}</strong>
            </td>
            <td />
            <td>
                <div className="vnd mono">
                    <strong>{Tools.numberFormat(data.order.vnd_total)}</strong>
                </div>
                <div className="cny mono">
                    <strong>{Tools.numberFormat(data.order.cny_total)}</strong>
                </div>
            </td>
            {/*
            <td>
                <div>
                    <strong>Địa chỉ: </strong>
                    {data.order.address_title || <em className="red">Chưa có địa chỉ nhận hàng...</em>}
                </div>
                <hr />
                <div className="row">
                    <div className="col-sm">
                        <strong>Kiểm đếm: </strong>
                    </div>
                    <div className="col-sm">
                        <BoolOutput value={data.order.count_check} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm">
                        <strong>Đóng gỗ: </strong>
                    </div>
                    <div className="col-sm">
                        <BoolOutput value={data.order.wooden_box} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm">
                        <strong>Chống sốc: </strong>
                    </div>
                    <div className="col-sm">
                        <BoolOutput value={data.order.shockproof} />
                    </div>
                </div>
                <hr />
                <div>
                    <strong>Ghi chú: </strong>
                    {data.order.note || <em>Chưa có ghi chú...</em>}
                </div>
            </td>
            */}
        </tr>
    </tbody>
);
