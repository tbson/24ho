// @flow
import * as React from 'react';
import {useState, useEffect, useContext, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about formik
import * as Yup from 'yup';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls, Context} from './_data';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import TextInput from 'src/utils/components/formik_input/TextInput';
import CheckInput from 'src/utils/components/formik_input/CheckInput';
import SelectInput from 'src/utils/components/formik_input/SelectInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
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
            .required(ErrMsgs.REQUIRED),
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

    static handleSubmit(id: number, onChange: Function, reOpenDialog: boolean) {
        return (values: Object, {setErrors}: Object) =>
            Service.changeRequest(id ? {...values, id} : values).then(({ok, data}) =>
                ok
                    ? onChange({...data, checked: false}, id ? 'update' : 'add', reOpenDialog)
                    : setErrors(Tools.setFormErrors(data))
            );
    }
}

type Props = {
    id: number,
    listSale: SelectOptions,
    listCustCare: SelectOptions,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, listSale, listCustCare, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const firstInputSelector = "[name='email']";

    const {validationSchema, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [reOpenDialog, setReOpenDialog] = useState(true);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...Tools.prepareUserData(resp.data), password: ''});
            setOpenModal(true);
        });

    useEffect(() => {
        open ? retrieveThenOpen(id) : setOpenModal(false);
        setReOpenDialog(id ? false : true);
    }, [open]);

    const focusFirstInput = () => {
        const firstInput = document.querySelector(`form ${firstInputSelector}`);
        firstInput && firstInput.focus();
    };

    const onClick = (handleSubmit: Function) => () => {
        setReOpenDialog(false);
        focusFirstInput();
        handleSubmit();
    };

    return (
        <DefaultModal open={openModal} close={close} title="Customer manager">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange, reOpenDialog)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <div className="row">
                            <div className="col">
                                <TextInput name="email" type="email" label="Email" required={true} autoFocus={true} />
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
                                <TextInput name="delivery_fee_mass_unit_price" label="Đơn giá vận chuyển Kg (VND)" />
                            </div>
                            <div className="col">
                                <TextInput
                                    name="delivery_fee_volume_unit_price"
                                    label="Đơn giá vận chuyển khối (VND)"
                                />
                            </div>
                        </div>

                        <TextInput name="complaint_days" label="Hạn khiếu nại (ngày)" />

                        <CheckInput name="is_lock" label="Khoá" />

                        <FormLevelErrMsg errors={errors.detail} />

                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
