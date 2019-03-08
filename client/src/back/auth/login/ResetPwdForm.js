// @flow
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

export class Service {
    static async request(params: Object) {
        const url = '/api/v1/admin/reset-password/';
        return await Tools.apiCall(url, params, 'POST');
    }

    static handleSubmit(onSuccess: Function, onError: Function) {
        return async (e: Object) => {
            e.preventDefault();
            const params = Tools.formDataToObj(new FormData(e.target));
            if (params.password !== params.passwordAgain) {
                const error = {
                    detail: 'Password mismatch!'
                };
                onError(Tools.setFormErrors(error));
            } else {
                const r = await Service.request(params);
                r.ok ? onSuccess(r.data) : onError(Tools.setFormErrors(r.data));
            }
        };
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

    useEffect(() => {
        setErrors({});
    }, [open]);

    if (!open) return null;
    return (
        <DefaultModal open={open} close={close} title="Reset password">
            <Form onSubmit={Service.handleSubmit(onChange, setErrors)} state={{data, errors}} children={children} />
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
            <TextInput id={id('username')} label="Username" required={true} autoFocus={true} />

            <TextInput id={id('password')} type="password" label="Password" required={true} />
            <TextInput id={id('passwordAgain')} type="password" label="Password again" required={true} />

            <ErrorMessages errors={errors.detail} />

            <ButtonsBar children={children} submitTitle={submitTitle} />
        </form>
    );
};
