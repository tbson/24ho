// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/formik_input/TextInput';
import CheckInput from 'src/utils/components/formik_input/CheckInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static initialValues = {
        uid: '',
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
        insurance_note: '',
        note: ''
    };

    static validationSchema = Yup.object().shape({
        uid: Yup.string().required(ErrMsgs.REQUIRED),
        mass: Yup.number(),
        length: Yup.number(),
        width: Yup.number(),
        height: Yup.number(),
        packages: Yup.number(),
        shockproof: Yup.number(),
        wooden_box: Yup.number(),
        insurance: Yup.number(),
        cny_shockproof_fee: Yup.number(),
        cny_wooden_box_fee: Yup.number(),
        cny_insurance_value: Yup.number(),
        insurance_note: Yup.string(),
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
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
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
                onSubmit={handleSubmit(id, onChange, reOpenDialog)}>
                {({errors, values, handleSubmit}) => (
                    <Form>
                        <TextInput name="uid" label="Mã vận đơn" autoFocus={true} required={true} />
                        <TextInput name="mass" label="Khối lượng (KG)" />
                        <div className="row">
                            <div className="col">
                                <TextInput name="length" label="Dài (Cm)" />
                            </div>
                            <div className="col">
                                <TextInput name="width" label="Rộng (Cm)" />
                            </div>
                            <div className="col">
                                <TextInput name="height" label="Cao (Cm)" />
                            </div>
                        </div>
                        <CheckInput name="shockproof" label="Chống sốc" />
                        {values.shockproof && <TextInput name="cny_shockproof_fee" label="Phí chống sốc (CNY)" />}
                        <CheckInput name="wooden_box" label="Đóng gỗ" />
                        {values.wooden_box && <TextInput name="cny_wooden_box_fee" label="Phí đóng gỗ (CNY)" />}
                        <CheckInput name="insurance" label="Bảo hiểm" />
                        {values.insurance && <TextInput name="cny_insurance_value" label="Giá trị bảo hiểm (CNY)" />}
                        <TextInput name="note" label="Ghi chú" />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
