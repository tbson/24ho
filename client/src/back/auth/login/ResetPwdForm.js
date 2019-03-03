// @flow
// $FlowFixMe: do not complain about hooks
import {useState} from 'react';
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

export class Service {
    static async loginReq(event: Object) {
        const params = Tools.formDataToObj(new FormData(event.target));
        const url = '/api/v1/admin/reset-password/';
        return await Tools.apiCall(url, params, 'POST');
    }
}

type Props = {
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    data?: Object
};
export default ({open, close, onChange, children, data = {}}: Props) => {
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e: Object) => {
        e.preventDefault();
        const r = await Service.loginReq(e);
        r.ok ? onChange(r.data) : setErrors(Tools.setFormErrors(r.data));
    };
    return (
        <DefaultModal open={open} close={close} title="Reset password">
            <Form onSubmit={handleSubmit} state={{data, errors}} children={children} />
        </DefaultModal>
    );
};

type FormProps = {
    onSubmit: Function,
    state: FormState,
    children?: React.Node,
    submitTitle?: string
};
export const Form = ({onSubmit, children, state, submitTitle = 'Reset password'}: FormProps) => {
    const name = 'reset-password';
    const id = Tools.getFieldId(name);
    const {username, password} = state.data;
    const {errors} = state;

    const errorMessages = (name: string): Array<string> => state.errors[name] || [];
    return (
        <form name={name} onSubmit={onSubmit}>
            <TextInput id={id('email')} type="email" label="Email" required={true} autoFocus={true} />

            <TextInput id={id('password')} type="password" label="Password" required={true} />
            <TextInput id={id('password-again')} type="password" label="Password again" required={true} />

            <ErrorMessages errors={errors.detail} />

            <ButtonsBar children={children} submitTitle={submitTitle} />
        </form>
    );
};
