// @flow
// $FlowFixMe: do not complain about hooks
import {useState} from 'react';
import * as React from 'react';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

export class Service {
    static async request(params: Object) {
        return await Tools.apiCall(apiUrls.auth, params, 'POST');
    }

    static handleSubmit(onSuccess: Function, onError: Function) {
        return async (e: Object) => {
            e.preventDefault();
            const params = Tools.formDataToObj(new FormData(e.target));
            const r = await Service.request(params);
            r.ok ? onSuccess(r.data) : onError(Tools.setFormErrors(r.data));
        };
    }
}

type Props = {
    onChange: Function,
    children?: React.Node,
    data?: Object
};
export default ({onChange, children, data = {}}: Props) => {
    const [errors, setErrors] = useState({});
    return <Form onSubmit={Service.handleSubmit(onChange, setErrors)} state={{data, errors}} children={children} />;
};

type FormProps = {
    onSubmit: Function,
    state: FormState,
    children?: React.Node,
    submitTitle?: string
};
export const Form = ({onSubmit, children, state, submitTitle = 'Submit'}: FormProps) => {
    const name = 'login';
    const id = Tools.getFieldId(name);
    const {username, password} = state.data;
    const {errors} = state;

    const errMsg = (name: string): Array<string> => state.errors[name] || [];
    return (
        <form name={name} onSubmit={onSubmit}>
            <TextInput
                id={id('username')}
                errMsg={errMsg('username')}
                label="Username"
                value={username}
                required={true}
                autoFocus={true}
            />

            <TextInput
                id={id('password')}
                errMsg={errMsg('password')}
                type="password"
                label="Password"
                value={password}
                required={true}
            />

            <ErrorMessages errors={errors.detail} />

            <ButtonsBar children={children} submitTitle={submitTitle} />
        </form>
    );
};
