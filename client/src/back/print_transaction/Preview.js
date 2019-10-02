// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import ReactToPrint from 'react-to-print';
// $FlowFixMe: do not complain about importing node_modules
import Barcode from 'react-barcode';
// $FlowFixMe: do not complain about Yup
import {Button, Modal} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from 'src/back/transaction/_data';
import logoUrl from 'src/assets/images/logo.jpg';

export class Service {
    static toggleEvent = 'TOGGLE_PRINT_TRANSACTION_FORM';

    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static retrieve(id: number) {
        return Tools.apiClient(apiUrls.print + id);
    }
}

type Props = {};

export default ({}: Props) => {
    const formName = 'Phiếu thu';
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
            <Modal
                destroyOnClose={true}
                visible={open}
                onCancel={() => Service.toggleForm(false)}
                footer={null}
                width="80%"
                title={formName}>
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
            amount,
            note,
            customer: {fullname, address}
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
                    <h1 className="center">PHIẾU THU TIỀN</h1>
                    <div className="center">{Tools.dateFormat(data.created_at)}</div>
                </div>
                <br />
                <div>
                    <span>Họ tên người nhận: </span>
                    <span>{fullname}</span>
                </div>
                <div>
                    <span>Địa chỉ: </span>
                    <span>{address}</span>
                </div>
                <div>
                    <span>Số tiền: </span>
                    <span>{Tools.numberFormat(amount)}₫</span>
                </div>
                <div>
                    <span>Lý do nộp: </span>
                    <span>{note}</span>
                </div>
                <br />
                <div className="row">
                    <div className="col center">
                        <strong>Người nộp</strong>
                        <div>
                            <em>(Ký, họ tên)</em>
                        </div>
                    </div>
                    <div className="col center">
                        <strong>Người nhận</strong>
                        <div>
                            <em>(Ký, họ tên)</em>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
