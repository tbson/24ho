// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import ReactToPrint from 'react-to-print';
// $FlowFixMe: do not complain about importing node_modules
import Barcode from 'react-barcode';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
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
        <div>
            <DefaultModal open={open} close={close} size="lg" title="Phiếu giao hàng">
                <div>
                    <Content data={data} ref={contentRef} />
                    <hr />
                    <ReactToPrint
                        onAfterPrint={() => Service.toggleForm(false)}
                        trigger={() => (
                            <div className="right">
                                <button className="btn btn-primary">
                                    <span className="fas fa-print" />
                                    &nbsp;&nbsp;<span>In phiếu thu</span>
                                </button>
                            </div>
                        )}
                        content={() => contentRef.current}
                    />
                </div>
            </DefaultModal>
        </div>
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
        return (
            <div style={{padding: 10, paddingTop: 40}}>
                <div className="row">
                    <div className="col">
                        <br />
                        <div>
                            <strong>{info_ten_cty}</strong>
                        </div>
                        <div>{info_dia_chi}</div>
                        <div>{info_email}</div>
                        <div>{info_phone}</div>
                        <div>{info_website}</div>
                    </div>
                    <div className="col" className="right">
                        <div>
                            <img src={logoUrl} height={50} />
                        </div>
                        <div>
                            <Barcode width={1} height={25} value={data.uid} />
                        </div>
                    </div>
                </div>
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
                <br/>
                <div>
                    <span>Phí giao hàng: </span>
                    <span>{Tools.numberFormat(vnd_delivery_fee)}₫</span>
                </div>
                <div>
                    <span>Tổng cộng: </span>
                    <span>{Tools.numberFormat(parseInt(vnd_total) + parseInt(vnd_delivery_fee))}₫</span>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        <span>Ghi chú: </span>
                    </div>
                    <div className="col-sm-9">
                        <div className="dot-underline">{note}</div>
                        <div className="dot-underline">&nbsp;</div>
                        <div className="dot-underline">&nbsp;</div>
                    </div>
                </div>
                <div>
                    <em>Ngày........Tháng........Năm........</em>
                </div>
                <br />
                <div className="row">
                    <div className="col center">
                        <strong>Bên giao</strong>
                        <div>
                            <em>(Ký, họ tên)</em>
                        </div>
                    </div>
                    <div className="col center">
                        <strong>Bên nhận</strong>
                        <div>
                            <em>(Ký, họ tên)</em>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
