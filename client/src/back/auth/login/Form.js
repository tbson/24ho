// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Formik, Form} from 'formik';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import type {ObjResp} from 'src/utils/helpers/Tools';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import TextInput from 'src/utils/components/formik_input/TextInput';

export class Service {
    static initialValues = {username: '', password: ''};

    static request(params: Object): Promise<ObjResp> {
        return Tools.apiCall(apiUrls.auth, params, 'POST');
    }

    static handleSubmit(onChange: Function) {
        const {request} = Service;

        return (values: Object, {setErrors}: Object) =>
            request(values).then(({ok, data}) => {
                ok ? onChange(data) : setErrors(Tools.setFormErrors(data));
            });
    }

    static validate(values: Object): Object {
        const errors = {
            username: !values.username && 'Required',
            password: !values.password && 'Required'
        };
        return Tools.removeEmptyKey(errors);
    }
}

type Props = {
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({onChange, children, submitTitle = 'Submit'}: Props) => {
    const {initialValues, validate, handleSubmit} = Service;
    return (
        <Formik initialValues={{...initialValues}} validate={validate} onSubmit={handleSubmit(onChange)}>
            {({errors, handleSubmit}) => (
                <Form>
                    <TextInput name="username" label="Username" autoFocus={true} required={true} />
                    <TextInput name="password" type="password" label="Password" required={true} />
                    <FormLevelErrMsg errors={errors.detail} />
                    <ButtonsBar children={children} submitTitle={submitTitle} onClick={handleSubmit}/>
                </Form>
            )}
        </Formik>
    );
};
