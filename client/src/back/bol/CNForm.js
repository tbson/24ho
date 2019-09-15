// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about formik
import type {FormikProps} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import {apiUrls as bagApiUrl} from 'src/back/bag/_data';
import TextInput from 'src/utils/components/input/TextInput';
import HiddenInput from 'src/utils/components/input/HiddenInput';
import CheckInput from 'src/utils/components/input/CheckInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static firstInputSelector = "#uid";

    static focusFirstInput() {
        const firstInput = document.querySelector(`form ${Service.firstInputSelector}`);
        firstInput && firstInput.focus();
    }

    static initialValues = {
        id: 0,
        uid: '',
        address_code: '',
        mass: 0,
        length: 0,
        width: 0,
        height: 0,
        packages: 1,
        shockproof: false,
        wooden_box: false,
        count_check: false,
        cny_shockproof_fee: 0,
        cny_wooden_box_fee: 0,
        cn_date: '',
        note: ''
    };

    static validationSchema = Yup.object().shape({
        id: Yup.number(),
        uid: Yup.string().required(ErrMsgs.REQUIRED),
        address_code: Yup.string(),
        mass: Yup.number(),
        length: Yup.number(),
        width: Yup.number(),
        height: Yup.number(),
        packages: Yup.number(),
        shockproof: Yup.boolean(),
        wooden_box: Yup.boolean(),
        count_check: Yup.boolean(),
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
        return id
            ? Tools.apiCall(apiUrls.crud + id, {}, 'GET', false)
            : Promise.resolve({ok: true, data: Service.initialValues});
    }

    static prepareParams(values: Object): Object {
        const id = values.id;
        const cn_date = values.cn_date || new Date();
        return id ? {...values, cn_date, id} : {...values, cn_date};
    }

    static handleSubmit(onChange: Function) {
        return (values: Object, {setErrors, resetForm}: Object) => {
            const params = Service.prepareParams(values);
            params.bag = parseInt(Service.getBagId());
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

    static checkUID(resetForm: Function, setOrderId: Function) {
        return (e: Object) => {
            const uid = e.target.value;
            Service.retrieveRequest(uid).then(resp => {
                if (resp.ok) {
                    resetForm(Tools.nullToDefault(resp.data, Service.initialValues));
                }
                setOrderId(resp.data && resp.data.order || 0);
            }).catch(() => {
                setOrderId(0);
            });
        };
    }

    static getBagId(): string {
        return window.location.pathname.split('/').pop();
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
    initialValues?: Object,
    onSubmit: Function,
    children?: React.Node,
    submitTitle?: string
};

export const BagPart = () => {
    const [bagName, setBagName] = useState('');
    const bagId = Service.getBagId();

    useEffect(() => {
        Tools.apiCall(bagApiUrl.crud + bagId, {}, 'GET', false).then(resp => resp.ok && setBagName(resp.data.uid));
    }, []);

    return (
        <div>
            <strong>Bao hàng: </strong>
            <span className="red">{bagName}</span>
        </div>
    );
};

export const FormPart = ({onSubmit, initialValues, submitTitle = '', children}: FormPartProps) => {
    const formRef = useRef<FormikProps | null>(null);
    const [orderId, setOrderId] = useState(0);
    const prepareToEdit = ({detail: uid}) => {
        formRef.current && formRef.current.resetForm({...Service.initialValues, uid});
        Service.focusFirstInput();
    };
    useEffect(() => {
        window.document.addEventListener('PREPARE_TO_EDIT', prepareToEdit, false);
        return () => {
            window.document.removeEventListener('PREPARE_TO_EDIT', prepareToEdit, false);
        };
    }, []);

    return (
        <Formik
            ref={formRef}
            initialValues={initialValues || Service.initialValues}
            validationSchema={Service.validationSchema}
            onSubmit={onSubmit}>
            {({errors, values, handleSubmit, resetForm}) => {
                return (
                    <Form>
                        <div className="row">
                            <div className="col">
                                <TextInput
                                    name="uid"
                                    label="Mã vận đơn"
                                    autoFocus={true}
                                    onBlur={Service.checkUID(resetForm, setOrderId)}
                                    required={true}
                                />
                            </div>
                            <div className="col">
                                <TextInput name="address_code" label="Mã địa chỉ" />
                            </div>
                        </div>
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
                        <div className="row">
                            <div className="col">
                                <CheckInput name="shockproof" label="Chống sốc" disabled={!!orderId}/>
                                {values.shockproof && (
                                    <TextInput name="cny_shockproof_fee" label="Phí chống sốc (CNY)" />
                                )}
                            </div>
                            <div className="col">
                                <CheckInput name="wooden_box" label="Đóng gỗ" disabled={!!orderId}/>
                                {values.wooden_box && <TextInput name="cny_wooden_box_fee" label="Phí đóng gỗ (CNY)" />}
                            </div>
                            <div className="col">
                                <CheckInput name="count_check" label="Kiểm đếm" disabled/>
                            </div>
                        </div>

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
};

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

    return (
        <DefaultModal open={openModal} close={close} title="Bol manager">
            <FormPart
                initialValues={initialValues}
                children={children}
                onSubmit={handleSubmit(onChange)}
                submitTitle={submitTitle}
            />
        </DefaultModal>
    );
};
