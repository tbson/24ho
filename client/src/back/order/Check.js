// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';

type Props = {};
type CheckInputProp = {
    id: number,
    checked_quantity: number,
    onChange: Function
};

export class Service {}

const CheckInput = ({id, checked_quantity, onChange}: CheckInputProp) => {
    const [value, setValue] = useState(checked_quantity);
    const handleChange = e => {
        const _value = e.target.value;
        setValue(_value);
        onChange(id, _value);
    };
    return (
        <div className="form-group">
            <input type="number" className="form-control" value={value} onChange={handleChange} />
        </div>
    );
};

const Row = ({data, index, onChange}) => {
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
    const [bolList, setBolList] = useState('');
    const [orderUid, setOrderUid] = useState('');
    const [bolUid, setBolUid] = useState('');
    const [checkedItems, setCheckedItems] = useState({});

    const handleUidChange = e => {
        const value = e.target.value;
        setBolUid(value);

        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => handleSearch(value), 500);
    };

    const handleSearch = (bag_uid: string) => {
        Tools.apiClient(apiUrls.getOrderitemsForChecking + bag_uid).then(data => {
            const extra = data.extra;
            const listItem = data.items || [];
            setList(listItem);
            setBolList(extra && extra.bols.map(item => item.uid).join(', '));
            setOrderUid(extra && extra.order.uid);
        });
    };

    const handleQuantityChange = (id, value) => {
        if (value) setCheckedItems({...checkedItems, [id]: parseInt(value)});
    };

    const submitCheck = () => {
        const params = {uid: orderUid, checked_items: checkedItems};
        Tools.apiClient(apiUrls.check, params, 'POST').then(data => {
            setList([]);
            setBolUid('');
            setBolList([]);
            setOrderUid('');
            const bolInputElm = document.querySelector('#bol-input');
            bolInputElm && bolInputElm.focus();
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

    return (
        <NavWrapper>
            <div style={{padding: 10, paddingBottom: 0}}>
                <div className="row">
                    <div className="col-md-3">
                        <div style={{display: 'flex'}}>
                            <div className="form-group" style={{flexGrow: 1}}>
                                <input
                                    className="form-control"
                                    id="bol-input"
                                    value={bolUid}
                                    onChange={handleUidChange}
                                    placeholder="Mã vận đơn..."
                                />
                            </div>
                            <div>
                                <button type="button" className="btn btn-success" onClick={submitCheck}>
                                    <span className="fas fa-check" />
                                    &nbsp;&nbsp;
                                    <span>Kiểm hoàn tất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div>
                            <strong>Đơn hàng: </strong>
                            <span>{orderUid || 'Chưa có...'}</span>
                        </div>
                        <div>
                            <strong>Vận đơn: </strong>
                            <span>{bolList || 'Chưa có ...'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <table className="table table-striped">
                <TableHead />
                <tbody>
                    {list.map((item, index) => (
                        <Row data={item} key={item.id} index={index} onChange={handleQuantityChange} />
                    ))}
                </tbody>
            </table>
        </NavWrapper>
    );
};
