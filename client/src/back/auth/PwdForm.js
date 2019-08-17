// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import type {ObjResp, TupleResp} from 'src/utils/helpers/Tools';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import TextInput from 'src/utils/components/input/TextInput';

export class Service {
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
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({mode = 'reset', open, close, onChange, children, submitTitle = 'Reset password'}: FormProps) => {
    const {initialValues, validate, handleSubmit} = Service;
    return (
        <DefaultModal open={open} close={close} title={submitTitle}>
            <Formik initialValues={initialValues} validate={validate(mode)} onSubmit={handleSubmit(onChange, mode)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <TextInput name="username" label="Username" autoFocus={true} required={true} />
                        <TextInput name="password" type="password" label="Password" required={true} />
                        <TextInput name="passwordAgain" type="password" label="Password again" required={true} />
                        {mode === 'change' && (
                            <TextInput name="oldPassword" type="password" label="Old password" required={true} />
                        )}
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={handleSubmit}/>
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
