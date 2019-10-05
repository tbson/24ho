// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import {Modal, Row, Col} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import CheckInput from 'src/utils/components/input/CheckInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_CART_ORDER_FORM';
    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static initialValues = {
        address: 0,
        note: '',
        count_check: false,
        wooden_box: false,
        shockproof: false
    };

    static getAddressLabel(id: number, listAddress: SelectOptions): string {
        const address = listAddress.find(item => item.value === id);
        return address ? address.label : '';
    }

    static handleSubmit(id: number, listAddress: SelectOptions, onChange: Function) {
        return (values: Object) => {
            values.address_title = Service.getAddressLabel(values.address, listAddress);
            onChange({[id]: values});
        };
    }
}

type Props = {
    rate: number,
    amount: number,
    defaultAddress: number,
    listOrder: Object,
    listAddress: SelectOptions,
    onChange: Function,
    submitTitle?: string
};
export default ({amount, rate, listOrder, defaultAddress, listAddress, onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Giỏ hàng';
    const {handleSubmit} = Service;

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);

    const [initialValues, setInitialValues] = useState(Service.initialValues);
    const [balance, setBalance] = useState(0);
    const [depositFactor, setDepositFactor] = useState(100);

    const handleToggle = ({detail: {open, id}}) => {
        setOpen(open);
        setId(id);
    };

    useEffect(() => {
        setInitialValues(listOrder[id] || {...Service.initialValues, address: defaultAddress || null});
        open &&
            Tools.apiClient(apiUrls.accountSummary).then(({balance, deposit_factor}) => {
                setBalance(balance);
                setDepositFactor(deposit_factor);
            });

        Tools.event.listen(Service.toggleEvent, handleToggle);
        return () => {
            Tools.event.remove(Service.toggleEvent, handleToggle);
        };
    }, []);

    let handleOk = Tools.emptyFunction;

    return (
        <Modal
            destroyOnClose={true}
            visible={open}
            onOk={() => handleOk()}
            onCancel={() => Service.toggleForm(false)}
            okText={submitTitle}
            cancelText="Thoát"
            title={formName}>
            <Formik initialValues={{...initialValues}} onSubmit={handleSubmit(id, listAddress, onChange)}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <SelectInput name="address" label="Địa chỉ" options={listAddress} required={true} />
                            <Row>
                                <Col span={8}>
                                    <CheckInput name="count_check" label="Kiểm đếm" />
                                </Col>
                                <Col span={8}>
                                    <CheckInput name="wooden_box" label="Đóng gỗ" />
                                </Col>
                                <Col span={8}>
                                    <CheckInput name="shockproof" label="Chống sốc" />
                                </Col>
                            </Row>
                            <TextInput name="note" label="Note" autoFocus={true} />
                            <AccountSummary
                                amount={amount}
                                rate={rate}
                                balance={balance}
                                depositFactor={depositFactor}
                            />
                            <br />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};

type AccountSummaryProps = {
    amount: number,
    rate: number,
    balance: number,
    depositFactor: number
};
const AccountSummary = ({amount, rate, balance, depositFactor}: AccountSummaryProps) => {
    const minDeposit = 3 * rate;
    const depositByFactor = parseInt((amount * depositFactor) / 100);
    const deposit = Math.max(minDeposit, depositByFactor);
    const topup = balance - deposit > 0 ? 0 : Math.abs(Math.floor(balance - deposit));
    return (
        <table className="table">
            <tbody>
                <tr>
                    <td>Số tiền cọc theo hệ số ({depositFactor}%)</td>
                    <td className="mono vnd">{Tools.numberFormat(deposit)}</td>
                </tr>
                <tr>
                    <td>Số dư trong tài khoản</td>
                    <td className="mono vnd">{Tools.numberFormat(balance)}</td>
                </tr>
                <tr>
                    <td>Số tiền cần nạp thêm</td>
                    <td className="mono vnd">{Tools.numberFormat(topup)}</td>
                </tr>
            </tbody>
        </table>
    );
};
