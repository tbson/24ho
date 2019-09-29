// @flow
import * as React from 'react';
import {useState, useEffect, useContext, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about formik
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Modal} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls, Context} from './_data';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import TextInput from 'src/utils/components/input/TextInput';
import CheckInput from 'src/utils/components/input/CheckInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_CUSTOMER_MAIN_FORM';
    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static initialValues = {
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        phone: '',
        company: '',
        order_fee_factor: 10,
        delivery_fee_mass_unit_price: 0,
        delivery_fee_volume_unit_price: 0,
        deposit_factor: 50,
        complaint_days: 2,
        sale: null,
        cust_care: null,
        group: null,
        is_lock: false
    };

    static validationSchema = Yup.object().shape({
        username: Yup.string().required('Required'),
        email: Yup.string()
            .email(ErrMsgs.EMAIL)
            .required(ErrMsgs.REQUIRED),
        first_name: Yup.string().required(ErrMsgs.REQUIRED),
        last_name: Yup.string().required(ErrMsgs.REQUIRED),
        phone: Yup.string()
            .required(ErrMsgs.REQUIRED)
            .max(10, ErrMsgs.PHONE),
        order_fee_factor: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .min(0, ErrMsgs.GT_0),
        delivery_fee_mass_unit_price: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .integer(ErrMsgs.INTEGER)
            .min(0, ErrMsgs.GT_0),
        delivery_fee_volume_unit_price: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .integer(ErrMsgs.INTEGER)
            .min(0, ErrMsgs.GT_0),
        deposit_factor: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .min(0, ErrMsgs.GT_0),
        complaint_days: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .integer(ErrMsgs.INTEGER)
            .min(0, ErrMsgs.GT_0)
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ok: true, data: Service.initialValues});
    }

    static handleSubmit(id: number, onChange: Function) {
        return (values: Object, {setErrors}: Object) => {
            return Service.changeRequest(id ? {...values, id} : values).then(({ok, data}) =>
                ok ? onChange({...data, checked: false}, id ? 'update' : 'add') : setErrors(Tools.setFormErrors(data))
            );
        };
    }
}

type Props = {
    listSale: SelectOptions,
    listCustCare: SelectOptions,
    listGroup: SelectOptions,
    onChange: Function,
    submitTitle?: string
};
export default ({listSale, listCustCare, listGroup, onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Cấu hình';
    const {validationSchema, handleSubmit} = Service;

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);

    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...Tools.prepareUserData(resp.data), password: ''});
            setOpen(true);
            setId(id);
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
                onSubmit={handleSubmit(id, onChange)}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <div className="row">
                                <div className="col">
                                    <TextInput
                                        name="email"
                                        type="email"
                                        label="Email"
                                        required={true}
                                        autoFocus={true}
                                    />
                                </div>
                                <div className="col">
                                    <TextInput name="username" label="Tên đăng nhập" required={true} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <TextInput name="last_name" label="Họ và tên lót" required={true} />
                                </div>
                                <div className="col">
                                    <TextInput name="first_name" label="Tên" required={true} />
                                </div>
                            </div>

                            <TextInput name="password" type="password" label="Password" />

                            <div className="row">
                                <div className="col">
                                    <TextInput name="phone" label="Số ĐT" required={true} />
                                </div>
                                <div className="col">
                                    <TextInput name="company" label="Tên cty" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <SelectInput name="sale" label="NV mua hàng" options={listSale} />
                                </div>
                                <div className="col">
                                    <SelectInput name="cust_care" label="NV chăm sóc" options={listCustCare} />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <TextInput name="order_fee_factor" label="Phí đặt hàng (%)" />
                                </div>
                                <div className="col">
                                    <TextInput name="deposit_factor" label="Hệ số cọc (%)" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <TextInput
                                        name="delivery_fee_mass_unit_price"
                                        label="Đơn giá vận chuyển Kg (VND)"
                                    />
                                </div>
                                <div className="col">
                                    <TextInput
                                        name="delivery_fee_volume_unit_price"
                                        label="Đơn giá vận chuyển khối (VND)"
                                    />
                                </div>
                            </div>

                            <TextInput name="complaint_days" label="Hạn khiếu nại (ngày)" />

                            <div className="row">
                                <div className="col">
                                    <SelectInput name="customer_group" label="Nhóm" options={listGroup} />
                                </div>
                            </div>

                            <CheckInput name="is_lock" label="Khoá" />

                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
