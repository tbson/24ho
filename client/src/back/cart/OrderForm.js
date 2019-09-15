// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
import Tools from 'src/utils/helpers/Tools';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import CheckInput from 'src/utils/components/input/CheckInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
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
    id: number,
    rate: number,
    amount: number,
    defaultAddress: number,
    listOrder: Object,
    listAddress: SelectOptions,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({
    id,
    amount,
    rate,
    listOrder,
    defaultAddress,
    listAddress,
    open,
    close,
    onChange,
    children,
    submitTitle = 'Save'
}: Props) => {
    const firstInputSelector = "[name='note']";
    const {handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [initialValues, setInitialValues] = useState(Service.initialValues);
    const [balance, setBalance] = useState(0);
    const [depositFactor, setDepositFactor] = useState(100);

    useEffect(() => {
        setOpenModal(open);
        setInitialValues(listOrder[id] || {...Service.initialValues, address: defaultAddress || null});
        open &&
            Tools.apiClient(apiUrls.accountSummary).then(({balance, deposit_factor}) => {
                setBalance(balance);
                setDepositFactor(deposit_factor);
            });
    }, [open]);

    const focusFirstInput = () => {
        const firstInput = document.querySelector(`form ${firstInputSelector}`);
        firstInput && firstInput.focus();
    };

    const onClick = (handleSubmit: Function) => () => {
        focusFirstInput();
        handleSubmit();
    };

    return (
        <DefaultModal open={openModal} close={close} title="Cart order manager">
            <Formik initialValues={{...initialValues}} onSubmit={handleSubmit(id, listAddress, onChange)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <SelectInput name="address" label="Address" options={listAddress} required={true} />
                        <div className="row">
                            <div className="col">
                                <CheckInput name="count_check" label="Kiểm đếm" />
                            </div>
                            <div className="col">
                                <CheckInput name="wooden_box" label="Đóng gỗ" />
                            </div>
                            <div className="col">
                                <CheckInput name="shockproof" label="Chống sốc" />
                            </div>
                        </div>
                        <TextInput name="note" label="Note" autoFocus={true} />
                        <AccountSummary amount={amount} rate={rate} balance={balance} depositFactor={depositFactor} />
                        <br />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
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
    const topup = balance - deposit > 0 ? 0 : Math.floor(balance - deposit);
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
