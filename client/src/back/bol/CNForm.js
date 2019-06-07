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
import HiddenInput from 'src/utils/components/formik_input/HiddenInput';
import CheckInput from 'src/utils/components/formik_input/CheckInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static firstInputSelector = "[name='uid']";

    static focusFirstInput() {
        const firstInput = document.querySelector(`form ${Service.firstInputSelector}`);
        firstInput && firstInput.focus();
    }

    static initialValues = {
        id: 0,
        uid: '',
        mass: 0,
        length: 0,
        width: 0,
        height: 0,
        packages: 1,
        shockproof: false,
        wooden_box: false,
        cny_shockproof_fee: 0,
        cny_wooden_box_fee: 0,
        cn_date: '',
        note: ''
    };

    static validationSchema = Yup.object().shape({
        id: Yup.number(),
        uid: Yup.string().required(ErrMsgs.REQUIRED),
        mass: Yup.number(),
        length: Yup.number(),
        width: Yup.number(),
        height: Yup.number(),
        packages: Yup.number(),
        shockproof: Yup.boolean(),
        wooden_box: Yup.boolean(),
        cny_shockproof_fee: Yup.number(),
        cny_wooden_box_fee: Yup.number(),
        note: Yup.string(),
        cn_date: Yup.date()
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ok: true, data: Service.initialValues});
    }

    static prepareParams(values: Object): Object {
        const id = values.id;
        const cn_date = values.cn_date || new Date();
        return id ? {...values, cn_date, id} : {...values, cn_date};
    }

    static handleSubmit(onChange: Function) {
        return (values: Object, {setErrors, resetForm}: Object) => {
            const params = Service.prepareParams(values);
            return Service.changeRequest(params).then(({ok, data}) => {
                if (ok) {
                    onChange({...data, checked: false}, params.id ? 'update' : 'add');
                    resetForm(Service.initialValues);
                    Service.focusFirstInput();
                } else {
                    setErrors(Tools.setFormErrors(data));
                }
            });
        };
    }

    static checkUID(resetForm: Function) {
        return (e: Object) => {
            const uid = e.target.value;
            Service.retrieveRequest(uid).then(resp => {
                resp.ok && resetForm(Tools.nullToDefault(resp.data, Service.initialValues));
            });
        };
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

type FormPartProps = {
    onSubmit: Function,
    children?: React.Node,
    submitTitle?: string
};

export const FormPart = ({onSubmit, submitTitle = '', children}: FormPartProps) => (
    <Formik initialValues={Service.initialValues} validationSchema={Service.validationSchema} onSubmit={onSubmit}>
        {({errors, values, handleSubmit, resetForm}) => {
            window.document.addEventListener('PREPARE_TO_EDIT', ({detail: uid}) => {
                resetForm({...Service.initialValues, uid})
                Service.focusFirstInput();
            }, false);
            return (
                <Form>
                    <TextInput
                        name="uid"
                        label="Mã vận đơn"
                        autoFocus={true}
                        onBlur={Service.checkUID(resetForm)}
                        required={true}
                    />
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
                    <TextInput name="note" label="Ghi chú" />
                    <HiddenInput name="cn_date" />
                    <HiddenInput name="id" />
                    <FormLevelErrMsg errors={errors.detail} />
                    <ButtonsBar children={children} submitTitle={submitTitle} />
                </Form>
            );
        }}
    </Formik>
);

export default ({id, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const {validationSchema, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
            setOpenModal(true);
        });

    useEffect(() => {
        open ? retrieveThenOpen(id) : setOpenModal(false);
    }, [open]);

    const onClick = (handleSubmit: Function) => () => {
        Service.focusFirstInput();
        handleSubmit();
    };

    return (
        <DefaultModal open={openModal} close={close} title="Bol manager">
            <FormPart children={children} onSubmit={handleSubmit(onChange)} submitTitle={submitTitle} />
        </DefaultModal>
    );
};
