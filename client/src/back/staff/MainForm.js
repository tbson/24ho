// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about formik
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Modal, Row, Col} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls, Context} from './_data';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import CheckInput from 'src/utils/components/input/CheckInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_ADMIN_MAIN_FORM';
    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static initialValues = {
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        groups: [],
        is_sale: false,
        is_cust_care: false,
        is_lock: false
    };

    static validationSchema = Yup.object().shape({
        username: Yup.string().required(ErrMsgs.REQUIRED),
        email: Yup.string()
            .email(ErrMsgs.EMAIL)
            .required(ErrMsgs.REQUIRED),
        first_name: Yup.string().required(ErrMsgs.REQUIRED),
        last_name: Yup.string().required(ErrMsgs.REQUIRED),
        groups: Yup.array().required(ErrMsgs.REQUIRED)
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
    listGroup: SelectOptions,
    onChange: Function,
    submitTitle?: string
};
export default ({listGroup, onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Admin';
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
                            <Row gutter={20}>
                                <Col span={12}>
                                    <TextInput
                                        name="email"
                                        type="email"
                                        label="Email"
                                        required={true}
                                        autoFocus={true}
                                    />
                                </Col>
                                <Col span={12}>
                                    <TextInput name="username" label="Tên đăng nhập" required={true} />
                                </Col>
                            </Row>
                            <Row gutter={20}>
                                <Col span={12}>
                                    <TextInput name="last_name" label="Họ và tên lót" required={true} />
                                </Col>
                                <Col span={12}>
                                    <TextInput name="first_name" label="Tên" required={true} />
                                </Col>
                            </Row>
                            <TextInput name="password" type="password" label="Password" />
                            <SelectInput
                                isMulti={true}
                                name="groups"
                                label="Quyền"
                                options={listGroup}
                                required={true}
                            />
                            <CheckInput name="is_sale" label="Nhân viên mua hàng" />
                            <CheckInput name="is_cust_care" label="Chăm sóc khách hàng" />
                            <CheckInput name="is_lock" label="Khoá" />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
