// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about Yup
import {Button, Checkbox} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput, BoolOutput} from 'src/utils/components/TableUtils';
import MainForm from '../MainForm';
import {Service as MainFormService} from '../MainForm';
import OrderForm from '../OrderForm';
import {Service as OrderFormService} from '../OrderForm';
import Row from './Row.js';

type CartGroup = {
    order: {
        shop_nick: string,
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
            }
            return resp;
        });
    }

    static syncCartRequest(): Promise<Object> {
        return Tools.apiCall(apiUrls.shoppingCart, Service.cartPayload, 'POST').then(resp => {
            if (resp.ok) {
                Service.savedCartItems = resp.data.items;
            }
            return resp;
        });
    }

    static sendCartRequest(payload: CartGroupPayload): Promise<Object> {
        return Tools.apiCall(apiUrls.orderCrud, payload, 'POST');
    }

    static get cartPayload() {
        const payload = {
            items: Service.savedCartItems
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

    static group(items: Array<Object>): Array<CartGroup> {
        const groups = [];
        for (let item of Service.calculate(items)) {
            const group = groups.find(group => {
                const {shop_nick, site} = group.order;
                return shop_nick === item.shop_nick && site === item.site;
            });
            const cleanedItem = {...item};
            delete cleanedItem.real_rate;
            delete cleanedItem.cny_unit_price;
            delete cleanedItem.vnd_unit_price;
            delete cleanedItem.shop_link;
            delete cleanedItem.shop_nick;
            delete cleanedItem.site;
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
                    items: [cleanedItem]
                });
            } else {
                group.items.push(cleanedItem);
            }
        }
        return groups.map(group => {
            group.order.cny_total = parseFloat(
                group.items.reduce((total, item) => total + item.cny_price, 0).toFixed(3)
            );
            group.order.vnd_total = parseInt(group.items.reduce((total, item) => total + item.vnd_price, 0));
            group.order.quantity = parseInt(group.items.reduce((total, item) => total + item.quantity, 0));
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
        return list.map(item => ({default: item.default, value: item.id, label: `${item.uid} - ${item.title}`}));
    }

    static extractShopList(items: Array<Object>): Array<string> {
        const uniqueItems = new Set(items.map(item => item.shop_nick));
        return Array.from(uniqueItems);
    }
}

export default ({}: Props) => {
    const defaultRate = 3600;
    const [list, setList] = useState([]);
    const [listAddress, setListAddress] = useState([]);
    const [rate, setRate] = useState(defaultRate);
    const [realRate, setRealRate] = useState(defaultRate);
    const [formOpen, setFormOpen] = useState<FormOpenType>({
        main: false,
        order: false
    });
    const [orderFormOpen, setOrderFormOpen] = useState(false);
    const [formId, setFormId] = useState(0);
    const [amount, setAmount] = useState(0);
    const [links, setLinks] = useState({next: '', previous: ''});
    const [checkedShops, setCheckedShop] = useState([]);

    const listAction = ListTools.actions(list);

    const getList = () => {
        const items = Service.savedCartItems;
        setList(ListTools.prepare(items));
    };

    const onItemChange = (data: TRow, type: string) => {
        MainFormService.toggleForm(false);
        if (!data.id) {
            data.rate = rate;
            data.real_rate = realRate;
            data.id = list.length ? Math.max(...list.map(item => item.id)) + 1 : 1;
        }
        const items = listAction(data)[type]();
        Service.savedCartItems = items;
        setList(items);
        Service.syncCartRequest();
    };

    const onCheck = id => setList(ListTools.checkOne(id, list));

    const onCheckAll = (condition: Object) => () => setList(ListTools.checkAll(list, condition));

    const onCheckShop = (shop_nick, checked) => {
        let result = [...checkedShops];
        if (checked && !list.includes(shop_nick)) result.push(shop_nick);
        if (!checked) result = result.filter(item => item !== shop_nick);
        setCheckedShop(result);
    };

    const onRemove = data => {
        const items = listAction(data).remove();
        Service.savedCartItems = items;
        setList(items);
        Service.syncCartRequest();
    };

    const removeItemsAndSave = (ids: Array<number>) => {
        const items = listAction({ids}).bulkRemove();
        Service.savedCartItems = items;
        setList(items);
        Service.syncCartRequest();
    };

    const onBulkRemove = (shop_nick: string) => () => {
        const ids = ListTools.getChecked(list.filter(item => item.shop_nick === shop_nick));
        if (!ids.length) return;

        const r = confirm(ListTools.getConfirmMessage(ids.length));
        r && removeItemsAndSave(ids);
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

    const sendOrder = async (listData: Array<Object>) => {
        let ids = [];
        const failOrder = [];
        for (const data of listData) {
            const payload = {
                order: JSON.stringify(data.order),
                items: JSON.stringify(data.items)
            };
            const resp = await Service.sendCartRequest(payload);
            if (resp.ok) {
                ids = ids.concat(data.items.map(item => item.id));
            } else {
                failOrder.push(data.order.shop_nick);
            }
        }
        removeItemsAndSave(ids);
        setCheckedShop([]);
        if (failOrder.length) {
            failStr = failOrder.join(', ');
            Tools.popMessage(`Không thể tạo đơn hàng: ${failStr}`, 'error');
        } else {
            Tools.popMessage('Đơn hàng được gửi thành công!');
        }
        OrderFormService.toggleForm(false);
    };

    const events = Service.events(setList);

    useEffect(() => {
        Tools.apiClient(apiUrls.rateLatest).then(data => {
            setRate(data.value || defaultRate);
            setRealRate(data.real_value || defaultRate);
        });
        Service.listAddressRequest().then(resp => {
            setListAddress(Service.addressesToOptions(resp.data.items));
            Service.getCartRequest()
                .then(getList)
                .then(Service.requestData);
        });
        events.subscribe();
        return () => events.unsubscribe();
    }, []);

    const groups = Service.group(list);

    const getGroupByShopNick = (shop_nicks: Array<string>, order: Object): Array<Object> => {
        return Service.group(list)
            .filter(item => shop_nicks.includes(item.order.shop_nick))
            .map(result => {
                result.order = {...result.order, ...order};
                return result;
            });
    };

    const getAmount = (shop_nicks: Array<string>, groups: Array<Object>) => {
        return groups
            .filter(group => shop_nicks.includes(group.order.shop_nick))
            .reduce((amount, group) => amount + group.order.vnd_total, 0);
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
                        <th className="row80">
                            <Button type="primary" icon="plus" onClick={() => MainFormService.toggleForm(true)}>
                                Sản phẩm
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

                {groups.length ? (
                    groups.map((group, groupKey) => (
                        <Group
                            data={group}
                            key={groupKey}
                            showForm={(id, vnd_total, shop_nick) =>
                                OrderFormService.toggleForm(
                                    true,
                                    getAmount([shop_nick], groups),
                                    [shop_nick],
                                    listAddress
                                )
                            }
                            onBulkRemove={onBulkRemove(group.order.shop_nick)}
                            onCheckAll={onCheckAll({shop_nick: group.order.shop_nick})}
                            onCheckShop={onCheckShop}>
                            {group.items.map((data, key) => (
                                <Row
                                    className="table-row"
                                    data={data}
                                    key={`${groupKey}${key}`}
                                    onCheck={onCheck}
                                    onRemove={onRemove}
                                    showForm={id => MainFormService.toggleForm(true, list.find(item => item.id === id))}
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
            {!!groups.length && (
                <Button
                    type="primary"
                    icon="check"
                    disabled={!checkedShops.length}
                    onClick={() =>
                        OrderFormService.toggleForm(true, getAmount(checkedShops, groups), checkedShops, listAddress)
                    }>
                    Gửi đơn đã chọn
                </Button>
            )}
            <br />
            <br />
            <MainForm onChange={onItemChange} />
            <OrderForm
                rate={rate}
                onChange={(shop_nicks, data) => {
                    sendOrder(getGroupByShopNick(shop_nicks, data));
                }}
            />
        </div>
    );
};

type GroupType = {
    data: Object,
    onCheckAll: Function,
    onCheckShop: Function,
    onBulkRemove: Function,
    showForm: Function,
    children: React.Node
};
export const Group = ({data, showForm, onCheckAll, onCheckShop, onBulkRemove, children}: Object) => (
    <tbody>
        <tr>
            <td colSpan={99} className="white-bg" />
        </tr>
        <tr>
            <td className="order-header">
                <Button size="small" icon="check" onClick={onCheckAll} />
            </td>
            <td colSpan={99} className="order-header">
                <Button
                    size="small"
                    icon="check"
                    type="primary"
                    onClick={() => showForm(data.order.shop_nick, data.order.vnd_total, data.order.shop_nick)}>
                    Gửi đơn
                </Button>
                &nbsp;&nbsp;&nbsp;
                <Checkbox onChange={e => onCheckShop(data.order.shop_nick, e.target.checked)}>
                    <span>
                        <strong>[{data.order.site}]</strong>
                        <span>&nbsp;/&nbsp;</span>
                        <a href={data.order.shop_link} target="_blank">
                            <strong>{data.order.shop_nick}</strong>
                        </a>
                    </span>
                </Checkbox>
            </td>
        </tr>
        {children}
        <tr>
            <td>
                <Button size="small" type="danger" icon="delete" onClick={onBulkRemove} />
            </td>
            <td />
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
        </tr>
    </tbody>
);
