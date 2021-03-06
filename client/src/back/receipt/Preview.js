// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import ReactToPrint from 'react-to-print';
// $FlowFixMe: do not complain about importing node_modules
import Barcode from 'react-barcode';
// $FlowFixMe: do not complain about Yup
import {Modal, Button, Row, Col} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from 'src/back/receipt/_data';
import logoUrl from 'src/assets/images/logo.jpg';

export class Service {
    static toggleEvent = 'TOGGLE_PRINT_RECEIPT_FORM';

    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static retrieve(id: number) {
        return Tools.apiClient(apiUrls.print + id);
    }

    static objectToList(bols: Object): Array<Object> {
        return Object.values(bols);
    }

    static bolsSum(bols: Object): Object {
        const listBol = Service.objectToList(bols);
        return listBol.reduce(
            (sumObj, bol) => {
                const vnd_delivery_fee = sumObj.vnd_delivery_fee + bol.vnd_delivery_fee;
                const vnd_insurance_fee = sumObj.vnd_insurance_fee + bol.vnd_insurance_fee;
                const vnd_sub_fee = sumObj.vnd_sub_fee + bol.vnd_sub_fee;
                return {vnd_delivery_fee, vnd_insurance_fee, vnd_sub_fee};
            },
            {vnd_delivery_fee: 0, vnd_insurance_fee: 0, vnd_sub_fee: 0}
        );
    }

    static ordersSum(orders: Object): Object {
        const listOrder = Service.objectToList(orders);
        return listOrder.reduce(
            (sumObj, order) => {
                const remain = sumObj.remain + order.remain;
                return {remain};
            },
            {remain: 0}
        );
    }
}

type Props = {
    close: Function
};

export default ({close}: Props) => {
    const contentRef = useRef();
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);

    const retrieveThenOpen = (id: number) =>
        Service.retrieve(id).then(data => {
            setData({...data});
            setOpen(true);
        });

    const handleToggle = ({detail: {open, id}}) => {
        open ? retrieveThenOpen(id) : setOpen(false);
    };

    useEffect(() => {
        Tools.event.listen(Service.toggleEvent, handleToggle);
        return () => {
            Tools.event.remove(Service.toggleEvent, handleToggle);
        };
    }, []);

    return (
        <Modal
            width="90%"
            destroyOnClose={true}
            visible={open}
            onOk={() => handleOk()}
            onCancel={() => Service.toggleForm(false)}
            footer={null}
            okText="Phiếu giao hàng"
            cancelText="Thoát"
            title="In phiếu giao hàng">
            <div>
                <Content data={data} ref={contentRef} />
                <hr />
                <ReactToPrint
                    onAfterPrint={() => Service.toggleForm(false)}
                    trigger={() => (
                        <div className="right">
                            <Button type="primary" icon="printer">
                                In phiếu thu
                            </Button>
                        </div>
                    )}
                    content={() => contentRef.current}
                />
            </div>
        </Modal>
    );
};

type ContentProps = {
    data: Object
};
class Content extends React.Component<ContentProps> {
    render() {
        const {data} = this.props;
        const {
            company_info: {info_ten_cty, info_dia_chi, info_email, info_phone, info_website},
            vnd_delivery_fee,
            vnd_total,
            note,
            address,
            customer,
            staff
        } = data;
        const bols = data.bols;
        const orders = data.orders;
        return (
            <div style={{padding: 10, paddingTop: 40}}>
                <Row>
                    <Col span={12}>
                        <br />
                        <div>
                            <strong>{info_ten_cty}</strong>
                        </div>
                        <div>{info_dia_chi}</div>
                        <div>{info_email}</div>
                        <div>{info_phone}</div>
                        <div>{info_website}</div>
                    </Col>
                    <Col span={12} className="right">
                        <div>
                            <img src={logoUrl} height={50} />
                        </div>
                        <div>
                            <Barcode width={1} height={25} value={data.uid} />
                        </div>
                    </Col>
                </Row>
                <br />
                <div>
                    <h1 className="center">PHIẾU GIAO HÀNG</h1>
                </div>
                <br />
                <div>
                    <span>Họ tên người nhận: </span>
                    <span>{customer.fullname}</span>
                </div>
                <div>
                    <span>Địa chỉ: </span>
                    <span>{address.title}</span>
                </div>
                <div>
                    <strong>Nhân viên lập phiếu: </strong>
                    <span>{staff.fullname}</span>
                </div>
                <div>
                    <span>{Tools.dateFormat(data.created_at)}</span>
                    &nbsp;
                    <span>|</span>
                    &nbsp;
                    <strong>{address.uid}</strong>
                </div>
                <br />
                {bols ? <BolTable bols={bols} /> : <OrderTable orders={orders} />}
                <br />
                <div>
                    <span>Phí giao hàng: </span>
                    <span>{Tools.numberFormat(vnd_delivery_fee)}₫</span>
                </div>
                <div>
                    <span>Tổng cộng: </span>
                    <span>{Tools.numberFormat(parseInt(vnd_total))}₫</span>
                </div>
                <Row>
                    <Col span={6}>
                        <span>Ghi chú: </span>
                    </Col>
                    <Col span={18}>
                        <div className="dot-underline">{note}</div>
                        <div className="dot-underline">&nbsp;</div>
                        <div className="dot-underline">&nbsp;</div>
                    </Col>
                </Row>
                <div>
                    <em>Ngày........Tháng........Năm........</em>
                </div>
                <br />
                <Row>
                    <Col span={12} className="center">
                        <strong>Bên giao</strong>
                        <div>
                            <em>(Ký, họ tên)</em>
                        </div>
                    </Col>
                    <Col span={12} className="center">
                        <strong>Bên nhận</strong>
                        <div>
                            <em>(Ký, họ tên)</em>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

type BolTableProps = {
    bols: Object
};
const BolTable = ({bols}: BolTableProps) => {
    const bolsSum = Service.bolsSum(bols);
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Mã vận đơn</th>
                    <th>Phí vận chuyển</th>
                    <th>Phí bảo hiểm</th>
                    <th>Chi phí khác</th>
                </tr>
            </thead>
            <tbody>
                {Service.objectToList(bols).map((bol, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{bol.uid}</td>
                        <td>{Tools.numberFormat(bol.vnd_delivery_fee)}</td>
                        <td>{Tools.numberFormat(bol.vnd_insurance_fee)}</td>
                        <td>{Tools.numberFormat(bol.vnd_sub_fee)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan="2">
                        <span>Tổng:</span>
                        &nbsp;
                        <strong>
                            {Tools.numberFormat(
                                bolsSum.vnd_delivery_fee + bolsSum.vnd_insurance_fee + bolsSum.vnd_sub_fee
                            )}
                        </strong>
                    </td>
                    <td>{Tools.numberFormat(bolsSum.vnd_delivery_fee)}</td>
                    <td>{Tools.numberFormat(bolsSum.vnd_insurance_fee)}</td>
                    <td>{Tools.numberFormat(bolsSum.vnd_sub_fee)}</td>
                </tr>
            </tfoot>
        </table>
    );
};

type OrderTableProps = {
    orders: Object
};
const OrderTable = ({orders}: OrderTableProps) => {
    const ordersSum = Service.ordersSum(orders);
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Mã đơn hàng</th>
                    <th>Tiền còn thiếu</th>
                </tr>
            </thead>
            <tbody>
                {Service.objectToList(orders).map((order, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{order.uid}</td>
                        <td>{Tools.numberFormat(order.remain)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan="2">
                        <span>Tổng:</span>
                        &nbsp;
                        <strong>{Tools.numberFormat(ordersSum.remain)}</strong>
                    </td>
                    <td>{Tools.numberFormat(ordersSum.remain)}</td>
                </tr>
            </tfoot>
        </table>
    );
};
