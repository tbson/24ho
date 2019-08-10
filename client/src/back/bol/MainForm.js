// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import {APP} from 'src/constants';
import OnlyAdmin from 'src/utils/components/OnlyAdmin';
import {DeliveryFeeTypeOptions} from './_data';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/formik_input/TextInput';
import CheckInput from 'src/utils/components/formik_input/CheckInput';
import SelectInput from 'src/utils/components/formik_input/SelectInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
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

    static retrieveRequest(id: number) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ok: true, data: Service.initialValues});
    }

    static handleSubmit(id: number, order_id: number, onChange: Function, reOpenDialog: boolean) {
        return (values: Object, {setErrors}: Object) => {
            let params = {...values};
            if (id) params = {...params, id};
            if (order_id) params = {...params, order: parseInt(order_id)};
            console.log(params);
            return Service.changeRequest(params).then(({ok, data}) =>
                ok
                    ? onChange({...data, checked: false}, id ? 'update' : 'add', reOpenDialog)
                    : setErrors(Tools.setFormErrors(data))
            );
        };
    }
}

type Props = {
    order_id?: number,
    id: number,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, order_id = 0, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const firstInputSelector = "[name='uid']";
    const {validationSchema, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [reOpenDialog, setReOpenDialog] = useState(true);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
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
        <DefaultModal open={openModal} close={close} title="Bol manager">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, order_id, onChange, reOpenDialog)}>
                {({errors, values, handleSubmit}) => (
                    <Form>
                        <div className="row">
                            <div className="col">
                                <TextInput name="uid" label="Mã vận đơn" autoFocus={true} required={true} />
                            </div>
                            <div className="col">
                                <TextInput name="address_code" label="Mã địa chỉ" />
                            </div>
                            <OnlyAdmin>
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
                                    <TextInput name="volume_unit_price" type="number" label="Đơn giá theo Khối (VND)" />
                                </div>
                            </div>
                        </OnlyAdmin>
                        <div className="row">
                            <div className="col">
                                <CheckInput name="shockproof" label="Chống sốc" />
                                {values.shockproof && (
                                    <TextInput name="cny_shockproof_fee" type="number" label="Phí chống sốc (CNY)" />
                                )}
                            </div>
                            <div className="col">
                                <CheckInput name="wooden_box" label="Đóng gỗ" />
                                {values.wooden_box && (
                                    <TextInput name="cny_wooden_box_fee" type="number" label="Phí đóng gỗ (CNY)" />
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
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
