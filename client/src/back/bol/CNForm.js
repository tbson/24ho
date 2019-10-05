// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about formik
import type {FormikProps} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Modal, Row, Col} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import {apiUrls as bagApiUrl} from 'src/back/bag/_data';
import TextInput from 'src/utils/components/input/TextInput';
import HiddenInput from 'src/utils/components/input/HiddenInput';
import CheckInput from 'src/utils/components/input/CheckInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_BOL_CN_FORM_FORM';
    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static firstInputSelector = '#uid';

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
            : Tools.apiCall(apiUrls.markCn + params.id, params, 'PUT');
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
                    const erorrMessages = Tools.setFormErrors(data);
                    setErrors(erorrMessages);
                    Tools.popMessage(Object.values(erorrMessages)[0], 'error');
                }
            });
        };
    }

    static checkUID(resetForm: Function, setOrderId: Function) {
        return (e: Object) => {
            const uid = e.target.value;
            Service.retrieveRequest(uid)
                .then(resp => {
                    if (resp.ok) {
                        resetForm(Tools.nullToDefault(resp.data, Service.initialValues));
                    }
                    setOrderId((resp.data && resp.data.order) || 0);
                })
                .catch(() => {
                    setOrderId(0);
                });
        };
    }

    static getBagId(): string {
        return window.location.pathname.split('/').pop();
    }
}

type Props = {
    onChange: Function,
    submitTitle?: string
};

type FormPartProps = {
    handleOk: Function,
    binHandleSubmit: Function,
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

export const FormPart = ({
    handleOk,
    binHandleSubmit,
    initialValues,
    onSubmit,
    children = null,
    submitTitle = ''
}: FormPartProps) => {
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
                if (handleOk === Tools.emptyFunction) binHandleSubmit(handleSubmit);
                return (
                    <Form>
                        <button className="hide" />
                        <Row gutter={20}>
                            <Col span={12}>
                                <TextInput
                                    name="uid"
                                    label="Mã vận đơn"
                                    autoFocus={true}
                                    onBlur={Service.checkUID(resetForm, setOrderId)}
                                    required={true}
                                />
                            </Col>
                            <Col span={12}>
                                <TextInput name="address_code" label="Mã địa chỉ" />
                            </Col>
                        </Row>
                        <TextInput name="mass" label="Khối lượng (KG)" />
                        <Row gutter={20}>
                            <Col span={8}>
                                <TextInput name="length" label="Dài (Cm)" />
                            </Col>
                            <Col span={8}>
                                <TextInput name="width" label="Rộng (Cm)" />
                            </Col>
                            <Col span={8}>
                                <TextInput name="height" label="Cao (Cm)" />
                            </Col>
                        </Row>
                        <Row gutter={20}>
                            <Col span={8}>
                                <CheckInput name="shockproof" label="Chống sốc" disabled={!!orderId} />
                                {values.shockproof && (
                                    <TextInput name="cny_shockproof_fee" label="Phí chống sốc (CNY)" />
                                )}
                            </Col>
                            <Col span={8}>
                                <CheckInput name="wooden_box" label="Đóng gỗ" disabled={!!orderId} />
                                {values.wooden_box && <TextInput name="cny_wooden_box_fee" label="Phí đóng gỗ (CNY)" />}
                            </Col>
                            <Col span={8}>
                                <CheckInput name="count_check" label="Kiểm đếm" disabled />
                            </Col>
                        </Row>

                        <TextInput name="note" label="Ghi chú" />
                        <HiddenInput name="cn_date" />
                        <HiddenInput name="id" />
                        <FormLevelErrMsg errors={errors.detail} />
                        <div>{children}</div>
                    </Form>
                );
            }}
        </Formik>
    );
};

export default ({onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Vận đơn TQ';
    const {validationSchema, handleSubmit} = Service;

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);

    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
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

    let handleOk = Tools.emptyFunction;

    const binHandleSubmit = method => {
        handleOk = method;
    };

    return (
        <Modal
            destroyOnClose={true}
            visible={open}
            onOk={() => handleOk()}
            onCancel={() => Service.toggleForm(false)}
            okText={submitTitle}
            cancelText="Thoát"
            title={Tools.getFormTitle(id, formName)}>
            <FormPart
                handleOk={handleOk}
                binHandleSubmit={binHandleSubmit}
                initialValues={initialValues}
                onSubmit={handleSubmit(onChange)}
                submitTitle={submitTitle}
            />
        </Modal>
    );
};
