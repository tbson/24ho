// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about hooks
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Modal, Row, Col} from 'antd';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {APP} from 'src/constants';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import FileInput from 'src/utils/components/input/FileInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_PROFIILE_FORM';
    static toggleForm(open: boolean) {
        Tools.event.dispatch(Service.toggleEvent, {open});
    }

    static initialValues = {avatar: '', username: '', email: '', first_name: '', last_name: '', phone: '', company: ''};

    static getProfileRequest() {
        return Tools.apiCall(apiUrls.profile);
    }

    static setProfileRequest(params: Object) {
        return Tools.apiCall(apiUrls.profile, params, 'POST');
    }

    static getProfile(callback: Function) {
        Service.getProfileRequest().then(resp => resp.ok && callback(resp.data));
    }

    static handleSubmit(onChange: Function) {
        const {setProfileRequest} = Service;
        return (values: Object, {setErrors}: Object) =>
            setProfileRequest(values).then(({ok, data}) => {
                ok ? onChange(data) : setErrors(Tools.setFormErrors(data));
            });
    }

    static validationSchema = Yup.object().shape({
        username: Yup.string().required(ErrMsgs.REQUIRED),
        email: Yup.string()
            .email(ErrMsgs.EMAIL)
            .required(ErrMsgs.REQUIRED),
        first_name: Yup.string().required(ErrMsgs.REQUIRED),
        last_name: Yup.string(),
        phone: Yup.string(),
        company: Yup.string()
    });

    static prepareUserData(data: Object): Object {
        data = Tools.prepareUserData(data);
        if (!data.avatar) data.avatar = '';
        return data;
    }
}

type Props = {
    onChange: Function
};
export default ({onChange}: Props) => {
    const [open, setOpen] = useState(false);
    const {validationSchema, handleSubmit, prepareUserData} = Service;
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = () =>
        Service.getProfile(profile => {
            setInitialValues(prepareUserData(profile));
            setOpen(true);
        });

    const handleToggle = ({detail: {open}}) => {
        open ? retrieveThenOpen() : setOpen(false);
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
            okText="Cập nhật"
            cancelText="Thoát"
            title="Cập nhật thông tin cá nhân">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(onChange)}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <Row gutter={20}>
                                {APP !== 'admin' && (
                                    <Col span={8}>
                                        <FileInput name="avatar" label="" />
                                    </Col>
                                )}
                                <Col span={APP !== 'admin' ? 16 : 24}>
                                    <TextInput name="username" label="Tên đăng nhập" required={true} autoFocus={true} />

                                    <TextInput name="email" type="email" label="Email" required={true} />

                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <TextInput name="first_name" label="Tên" />
                                        </Col>
                                        <Col span={12}>
                                            <TextInput name="last_name" label="Họ" />
                                        </Col>
                                    </Row>

                                    {APP !== 'admin' && (
                                        <TextInput name="phone" label="Số điện thoại" required={true} />
                                    )}
                                    {APP !== 'admin' && <TextInput name="company" label="Tên công ty" />}
                                </Col>
                            </Row>

                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
