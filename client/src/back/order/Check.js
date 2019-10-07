// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing
import {Input, InputNumber, Button, Col, Row} from 'antd';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import CheckForm from './CheckForm';
import {Service as CheckFormService} from './CheckForm';

const {Search} = Input;
type Props = {};
type CheckInputProp = {
    id: number,
    checked_quantity: number,
    onChange: Function
};

export class Service {
    static CHECKED_STATUS = {
        OK: 0,
        MISSING: 1,
        OVER: 2
    };
    static listToObj(listItem: Array<Object>): Object {
        const originalCheckedItems = {};
        for (const item of listItem) {
            originalCheckedItems[item.id] = item.checked_quantity;
        }
        return originalCheckedItems;
    }
    static mergeCheckedQuantity(listItem: Array<Object>, checkedItems: Object): Object {
        const originalCheckedItems = Service.listToObj(listItem);
        return {...originalCheckedItems, ...checkedItems};
    }

    static checkedStatus(listItem: Object, checkedItems: Object): number {
        const originalCheckedItems = Service.listToObj(listItem);
        const status = Service.CHECKED_STATUS['OK'];
        for (const i in originalCheckedItems) {
            if (originalCheckedItems[i] > checkedItems[i]) return Service.CHECKED_STATUS['MISSING'];
            if (originalCheckedItems[i] < checkedItems[i]) return Service.CHECKED_STATUS['OVER'];
        }
        return status;
    }
}

const CheckInput = ({id, checked_quantity, onChange}: CheckInputProp) => {
    const [value, setValue] = useState(checked_quantity);
    const handleChange = _value => {
        setValue(_value);
        onChange(id, _value);
    };
    return (
        <div className="form-group">
            <InputNumber min={0} max={9999} block defaultValue={value} onChange={handleChange} />
        </div>
    );
};

const TableRow = ({data, index, onChange}) => {
    return (
        <tr>
            <td>{index + 1}</td>
            <td>
                <CheckInput id={data.id} checked_quantity={data.checked_quantity} onChange={onChange} />
            </td>
            <td className="right mono">{data.quantity}</td>
            <td>
                <table width="100%">
                    <tbody>
                        <tr>
                            <td width="72px">
                                <img src={data.image} width="100%" />
                            </td>
                            <td>
                                <div>
                                    <a href={data.link} target="_blank">
                                        {data.title}
                                    </a>
                                </div>
                                {data.color && (
                                    <div>
                                        <strong>Màu: </strong>
                                        <span>{data.color}</span>
                                    </div>
                                )}
                                {data.size && (
                                    <div>
                                        <strong>Size: </strong>
                                        <span>{data.size}</span>
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    );
};

let inputTimeout;
export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [listBol, setListBol] = useState('');
    const [orderUid, setOrderUid] = useState('');
    const [bolUid, setBolUid] = useState('');
    const [checkedItems, setCheckedItems] = useState({});

    const handleUidChange = e => {
        const value = e.target.value;
        setBolUid(value);

        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => handleSearch(value), 500);
    };

    const reset = () => {
        setList([]);
        setBolUid('');
        setListBol('');
        setOrderUid('');
        const bolInputElm = document.querySelector('#bol-input');
        bolInputElm && bolInputElm.focus();
    };

    const handleSearch = (bag_uid: string) => {
        Tools.apiClient(apiUrls.getOrderitemsForChecking + bag_uid)
            .then(data => {
                const extra = data.extra;
                const listItem = data.items || [];
                setList(listItem);
                setListBol(extra && extra.bols.map(item => item.uid).join(', '));
                setOrderUid(extra && extra.order.uid);
            })
            .catch(reset);
    };

    const handleQuantityChange = (id, value) => {
        if (value) setCheckedItems({...checkedItems, [id]: parseInt(value)});
    };

    const submitCheck = () => {
        const checkedItemsFull = Service.mergeCheckedQuantity(list, checkedItems);
        const status = Service.checkedStatus(list, checkedItemsFull);
        if (status === Service.CHECKED_STATUS['OVER']) return alert('Số lượng kiểm vượt quá số lượng thực.');
        if (status === Service.CHECKED_STATUS['MISSING']) {
            return CheckFormService.toggleForm(true);
        }
        const params = {uid: orderUid, checked_items: checkedItems};
        Tools.apiClient(apiUrls.check, params, 'POST').then(data => {
            reset();
            Tools.popMessage('Kiểm hàng thành công, quét vận đơn khác để tiếp tục.');
        });
    };

    const TableHead = () => (
        <thead className="thead-light">
            <tr>
                <th scope="col">#</th>
                <th scope="col" style={{width: 140}}>
                    Số lượng kiểm
                </th>
                <th scope="col" style={{width: 80}}>
                    Số lượng
                </th>
                <th scope="col">Sản phẩm</th>
            </tr>
        </thead>
    );

    useEffect(() => {}, []);

    const onSelectBol = ({bols}) => {
        const params = {uid: orderUid, checked_items: checkedItems, potential_bols: bols.join(',')};
        Tools.apiClient(apiUrls.check, params, 'POST').then(data => {
            reset();
            Tools.popMessage('Kiểm hàng thành công, quét vận đơn khác để tiếp tục.');
        });
        CheckFormService.toggleForm(false);
    };

    return (
        <NavWrapper>
            <div style={{padding: 10, paddingBottom: 0}}>
                <Row gutter={20}>
                    <Col span={6}>
                        <div style={{display: 'flex'}}>
                            <div className="form-group" style={{flexGrow: 1}}>
                                <Input
                                    id="bol-input"
                                    size="large"
                                    value={bolUid}
                                    onChange={handleUidChange}
                                    placeholder="Mã vận đơn..."
                                />
                            </div>
                            &nbsp;
                            <div>
                                <Button type="primary" size="large" icon="check" onClick={submitCheck}>
                                    Kiểm hoàn tất
                                </Button>
                            </div>
                        </div>
                    </Col>
                    <Col span={18}>
                        <div>
                            <strong>Đơn hàng: </strong>
                            <span>{orderUid || 'Chưa có...'}</span>
                        </div>
                        <div>
                            <strong>Vận đơn: </strong>
                            <span>{listBol || 'Chưa có ...'}</span>
                        </div>
                    </Col>
                </Row>
            </div>

            <table className="table table-striped">
                <TableHead />
                <tbody>
                    {list.map((item, index) => (
                        <TableRow data={item} key={item.id} index={index} onChange={handleQuantityChange} />
                    ))}
                </tbody>
            </table>

            <CheckForm
                listBol={listBol.split(', ').map(item => ({value: item, label: item}))}
                close={() => CheckFormService.toggleForm(false)}
                onChange={onSelectBol}
            />
        </NavWrapper>
    );
};
