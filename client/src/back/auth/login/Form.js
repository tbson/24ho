// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Formik, Form} from 'formik';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import type {ObjResp, TupleResp} from 'src/utils/helpers/Tools';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import TextInput from 'src/utils/components/formik_input/TextInput';

export class Service {
    static async request(params: Object): Promise<ObjResp> {
        return await Tools.apiCall(apiUrls.auth, params, 'POST');
    }

    static async handleSubmit(params: Object): Promise<TupleResp> {
        const r = await Service.request(params);
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
    onChange: Function,
    children?: React.Node
};
export default ({onChange, children}: Props) => {
    const onSubmitOk = Service.onSubmitOk(onChange);
    return <F onSubmit={value => Service.handleSubmit(value).then(onSubmitOk)} children={children} />;
};

type FormProps = {
    onSubmit: Function,
    children?: React.Node,
    submitTitle?: string
};
export const F = ({onSubmit, children, submitTitle = 'Submit'}: FormProps) => {
    const initialValues = {username: '', password: ''};
    const validate = values => {
        const errors = {
            username: !values.username && 'Required',
            password: !values.password && 'Required'
        };
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
                    <FormLevelErrMsg errors={errors.detail} />
                    <ButtonsBar children={children} submitTitle={submitTitle} />
                </Form>
            )}
        </Formik>
    );
};
