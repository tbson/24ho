// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import {Modal} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import type {ObjResp, TupleResp} from 'src/utils/helpers/Tools';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import TextInput from 'src/utils/components/input/TextInput';

export class Service {
    static toggleEvent = 'TOGGLE_CHANGE_PASSWORD_FORM';
    static toggleForm(open: boolean) {
        Tools.event.dispatch(Service.toggleEvent, {open});
    }

    static initialValues = {username: '', password: '', passwordAgain: '', oldPassword: ''};

    static prepareParams(params: Object, mode: string): Object {
        mode === 'reset' && delete params.oldPassword;
        delete params.passwordAgain;
        return params;
    }

    static async request(params: Object, mode: string): Promise<ObjResp> {
        return await Tools.apiCall(apiUrls[`${mode}Password`], params, 'POST');
    }

    static handleSubmit(onChange: Function, mode: string) {
        const {prepareParams, request} = Service;

        return (values: Object, {setErrors}: Object) => {
            const params = prepareParams({...values}, mode);
            request(params, mode).then(({ok, data}) => {
                ok ? onChange(data) : setErrors(Tools.setFormErrors(data));
            });
        };
    }

    static validate(mode: string) {
        return ({username, password, passwordAgain, oldPassword}: Object) => {
            const errors = {
                username: !username && 'Required',
                password: !password && 'Required',
                passwordAgain: !passwordAgain && 'Required',
                oldPassword: mode === 'change' && !oldPassword && 'Required'
            };

            if (password && password !== passwordAgain) {
                errors.password = "Password doesn't match";
            }
            return Tools.removeEmptyKey(errors);
        };
    }
}

type FormProps = {
    mode?: string,
    onChange: Function
};
export default ({mode = 'reset', onChange}: FormProps) => {
    const [open, setOpen] = useState(false);
    const {initialValues, validate, handleSubmit} = Service;

    const handleToggle = ({detail: {open}}) => {
        setOpen(open);
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
            okText={mode === 'reset' ? 'Reset' : 'Đổi'}
            cancelText="Thoát"
            title={`${mode === 'reset' ? 'Reset' : 'Đổi'} mật khẩu`}>
            <Formik initialValues={initialValues} validate={validate(mode)} onSubmit={handleSubmit(onChange, mode)}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <TextInput name="username" label="Tên đăng nhập" autoFocus={true} required={true} />
                            <TextInput name="password" type="password" label="Mật khẩu" required={true} />
                            <TextInput name="passwordAgain" type="password" label="Nhập lại mật khẩu" required={true} />
                            {mode === 'change' && (
                                <TextInput name="oldPassword" type="password" label="Mật khẩu cũ" required={true} />
                            )}
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
