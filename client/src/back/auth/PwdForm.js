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
import TextInput from 'src/utils/components/formik_input/TextInput';

export class Service {
    static prepareParams(params: Object, mode: string): Object {
        mode === 'reset' && delete params.oldPassword;
        delete params.passwordAgain;
        return params;
    }

    static async request(params: Object, mode: string): Promise<ObjResp> {
        return await Tools.apiCall(apiUrls[`${mode}Password`], params, 'POST');
    }

    static async handleSubmit(params: Object, mode: string): Promise<TupleResp> {
        const _params = Service.prepareParams({...params}, mode);
        const r = await Service.request(_params, mode);

        return [!!r.ok, r.data || {}];
    }

    static onSubmitOk(onChange: Function): Function {
        return ([ok, data]: TupleResp): TupleResp => {
            ok && onChange(data);
            return [ok, data];
        };
    }
}

type Props = {
    mode?: string,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    data?: Object
};
export default ({mode = 'reset', open, close, onChange, children, data = {}}: Props) => {
    const onSubmitOk = Service.onSubmitOk(onChange);
    return (
        <DefaultModal open={open} close={close} title="Reset password">
            <F
                mode={mode}
                onSubmit={values => Service.handleSubmit(values, mode).then(onSubmitOk)}
                children={children}
            />
        </DefaultModal>
    );
};

type FormProps = {
    mode: string,
    onSubmit: Function,
    children?: React.Node,
    submitTitle?: string
};
export const F = ({mode, onSubmit, children, submitTitle = 'Reset password'}: FormProps) => {
    const initialValues = {username: '', password: '', passwordAgain: '', oldPassword: ''};
    const validate = ({username, password, passwordAgain, oldPassword}) => {
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

    return (
        <Formik
            initialValues={initialValues}
            validate={validate}
            onSubmit={(values, {setErrors}) =>
                onSubmit(values).then(([ok, data]) => !ok && setErrors(Tools.setFormErrors(data)))
            }>
            {({errors}) => (
                <Form>
                    <TextInput name="username" label="Username" autoFocus={true} required={true} />
                    <TextInput name="password" type="password" label="Password" required={true} />
                    <TextInput name="passwordAgain" type="password" label="Password again" required={true} />
                    {mode === 'change' && (
                        <TextInput name="oldPassword" type="password" label="Old password" required={true} />
                    )}
                    <FormLevelErrMsg errors={errors.detail} />
                    <ButtonsBar children={children} submitTitle={submitTitle} />
                </Form>
            )}
        </Formik>
    );
};
