// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Modal} from 'antd';
import {APP} from 'src/constants';
import OnlyAdmin from 'src/utils/components/OnlyAdmin';
import {DeliveryFeeTypeOptions} from './_data';
import Tools from 'src/utils/helpers/Tools';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import CheckInput from 'src/utils/components/input/CheckInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_BOL_MAIN_FORM';
    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static initialValues = {
        uid: '',
        address_code: '',
        purchase_code: '',
        mass: 0,
        length: 0,
        width: 0,
        height: 0,
        packages: 0,
        shockproof: false,
        wooden_box: false,
        insurance: false,
        cny_shockproof_fee: 0,
        cny_wooden_box_fee: 0,
        cny_insurance_value: 0,
        delivery_fee_type: 1,
        mass_unit_price: 0,
        volume_unit_price: 0,
        note: ''
    };

    static validationSchema = Yup.object().shape({
        uid: Yup.string().required(ErrMsgs.REQUIRED),
        address_code: Yup.string(),
        purchase_code: Yup.string(),
        mass: Yup.number(),
        length: Yup.number(),
        width: Yup.number(),
        height: Yup.number(),
        packages: Yup.number(),
        shockproof: Yup.boolean(),
        wooden_box: Yup.boolean(),
        insurance: Yup.boolean(),
        cny_shockproof_fee: Yup.number(),
        cny_wooden_box_fee: Yup.number(),
        cny_insurance_value: Yup.number(),
        delivery_fee_type: Yup.number(),
        mass_unit_price: Yup.number(),
        volume_unit_price: Yup.number(),
        note: Yup.string()
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number, initialValues: ?Object) {
        return id
            ? Tools.apiCall(apiUrls.crud + id)
            : Promise.resolve({ok: true, data: initialValues || Service.initialValues});
    }

    static handleSubmit(id: number, order_id: number, onChange: Function) {
        return (values: Object, {setErrors}: Object) => {
            let params = {...values};
            if (id) params = {...params, id};
            if (order_id) params = {...params, order: parseInt(order_id)};
            return Service.changeRequest(params).then(({ok, data}) =>
                ok ? onChange({...data, checked: false}, id ? 'update' : 'add') : setErrors(Tools.setFormErrors(data))
            );
        };
    }

    static getAddressOptions(listAddress: Array<Object>): SelectOptions {
        return listAddress.map(item => ({value: item.uid, label: item.uid + '-' + item.title}));
    }
}

type Props = {
    order_id?: number,
    onChange: Function,
    submitTitle?: string
};
export default ({order_id = 0, onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Vận đơn';
    const {validationSchema, handleSubmit} = Service;

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);

    const [initialValues, setInitialValues] = useState(Service.initialValues);
    const [addressOptions, setAddressOptions] = useState([]);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id, id ? initialValues : Service.initialValues).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
            setOpen(true);
            setId(id);
        });

    const handleToggle = ({detail: {open, id}}) => {
        open ? retrieveThenOpen(id) : setOpen(false);
    };

    useEffect(() => {
        if (!Tools.isAdmin()) {
            Tools.fetch(apiUrls.addressCrud).then(listAddress => {
                setAddressOptions(Service.getAddressOptions(listAddress.items));
                const defaultAddress = listAddress.items.find(item => item.default === true);
                if (defaultAddress) {
                    const bol = {...initialValues, address_code: defaultAddress.uid};
                    setInitialValues(bol);
                }
            });
        }

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
            title={Tools.getFormTitle(id, formName)}>
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, order_id, onChange)}>
                {({errors, values, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <div className="row">
                                <div className="col">
                                    <TextInput name="uid" label="Mã vận đơn" autoFocus={true} required={true} />
                                </div>
                                <OnlyAdmin reverse={true}>
                                    <div className="col">
                                        <SelectInput name="address_code" options={addressOptions} label="Mã địa chỉ" />
                                    </div>
                                </OnlyAdmin>
                                <OnlyAdmin>
                                    <div className="col">
                                        <TextInput name="address_code" label="Mã địa chỉ" />
                                    </div>
                                    <div className="col">
                                        <TextInput name="purchase_code" label="Mã giao dịch" />
                                    </div>
                                </OnlyAdmin>
                            </div>
                            <TextInput name="mass" type="number" label="Khối lượng (KG)" />
                            <div className="row">
                                <div className="col">
                                    <TextInput name="length" type="number" label="Dài (Cm)" />
                                </div>
                                <div className="col">
                                    <TextInput name="width" type="number" label="Rộng (Cm)" />
                                </div>
                                <div className="col">
                                    <TextInput name="height" type="number" label="Cao (Cm)" />
                                </div>
                            </div>
                            <OnlyAdmin>
                                <div className="row">
                                    <div className="col">
                                        <TextInput name="mass_unit_price" type="number" label="Đơn giá theo Kg (VND)" />
                                    </div>
                                    <div className="col">
                                        <TextInput
                                            name="volume_unit_price"
                                            type="number"
                                            label="Đơn giá theo Khối (VND)"
                                        />
                                    </div>
                                </div>
                            </OnlyAdmin>
                            <div className="row">
                                <div className="col">
                                    <CheckInput name="shockproof" label="Chống sốc" disabled={!!order_id} />
                                    {values.shockproof && (
                                        <OnlyAdmin>
                                            <TextInput
                                                name="cny_shockproof_fee"
                                                type="number"
                                                label="Phí chống sốc (CNY)"
                                            />
                                        </OnlyAdmin>
                                    )}
                                </div>
                                <div className="col">
                                    <CheckInput name="wooden_box" label="Đóng gỗ" disabled={!!order_id} />
                                    {values.wooden_box && (
                                        <OnlyAdmin>
                                            <TextInput
                                                name="cny_wooden_box_fee"
                                                type="number"
                                                label="Phí đóng gỗ (CNY)"
                                            />
                                        </OnlyAdmin>
                                    )}
                                </div>
                                {!order_id && (
                                    <div className="col">
                                        <CheckInput name="insurance" label="Bảo hiểm" />
                                        {values.insurance && (
                                            <TextInput
                                                name="cny_insurance_value"
                                                type="number"
                                                label="Giá trị bảo hiểm (CNY)"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            <OnlyAdmin>
                                <SelectInput
                                    name="delivery_fee_type"
                                    options={DeliveryFeeTypeOptions}
                                    label="Cách tính phí vận chuyển"
                                />
                            </OnlyAdmin>
                            <TextInput name="note" label="Ghi chú" />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
