// @flow
// $FlowFixMe: do not complain about hooks
import {useState} from 'react';
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

export class Service {
    static async loginReq(event: Object) {
        const params = Tools.formDataToObj(new FormData(event.target));
        const url = '/api/v1/admin/auth/';
        return await Tools.apiCall(url, params, 'POST');
    }
}

type Props = {
    onChange: Function,
    children?: React.Node,
    data?: Object
};
export default ({onChange, children, data = {}}: Props) => {
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e: Object) => {
        e.preventDefault();
        const r = await Service.loginReq(e);
        r.ok ? onChange(r.data) : setErrors(Tools.setFormErrors(r.data));
    };

    return <Form onSubmit={handleSubmit} state={{data, errors}} children={children} />;
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

    const errorMessages = (name: string): Array<string> => state.errors[name] || [];
    return (
        <form name={name} onSubmit={onSubmit}>
            <TextInput
                id={id('username')}
                errorMessages={errorMessages('username')}
                label="Username"
                value={username}
                required={true}
                autoFocus={true}
            />

            <TextInput
                id={id('password')}
                errorMessages={errorMessages('password')}
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
