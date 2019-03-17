// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

export class Service {
    
    static validate(params: Object): Object {
        const {password, passwordAgain} = params;
        return password === passwordAgain
            ? {}
            : {
                  detail: 'Password mismatch!'
              };
    }

    static prepareParams(mode: string): Object {
        return (params: Object) => {
            mode === 'reset' && delete params.oldPassword;
            delete params.passwordAgain;
            return params;
        };
    }

    static request(mode: string) {
        return async (params: Object) => await Tools.apiCall(apiUrls[`${mode}Password`], params, 'POST');
    }

    static handleSubmit(mode: string, onSuccess: Function, onError: Function) {
        const request = Service.request(mode);
        const prepareParams = Service.prepareParams(mode);

        return async (e: Object) => {
            e.preventDefault();
            const params = Tools.formDataToObj(new FormData(e.target));
            const errors = Service.validate(params);
            if (!Tools.isEmpty(errors)) {
                onError(Tools.setFormErrors(errors));
            } else {
                const r = await request(prepareParams({...params}));
                r.ok ? onSuccess(r.data) : onError(Tools.setFormErrors(r.data));
            }
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
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setErrors({});
    }, [open]);

    return (
        <DefaultModal open={open} close={close} title="Reset password">
            <Form
                mode={mode}
                onSubmit={Service.handleSubmit(mode, onChange, setErrors)}
                state={{data, errors}}
                children={children}
            />
        </DefaultModal>
    );
};

type FormProps = {
    mode: string,
    onSubmit: Function,
    state: FormState,
    children?: React.Node,
    submitTitle?: string
};
export const Form = ({mode, onSubmit, children, state, submitTitle = 'Reset password'}: FormProps) => {
    const name = 'reset-pwd';
    const id = Tools.getFieldId(name);
    const {username, password} = state.data;
    const {errors} = state;

    const errorMessages = (name: string): Array<string> => state.errors[name] || [];
    return (
        <form name={name} onSubmit={onSubmit}>
            <TextInput id={id('username')} label="Username" required={true} autoFocus={true} />

            <TextInput id={id('password')} type="password" label="Password" required={true} />
            <TextInput id={id('passwordAgain')} type="password" label="Password again" required={true} />
            {mode === 'change' && (
                <TextInput id={id('oldPassword')} type="password" label="Old password" required={true} />
            )}
            <ErrorMessages errors={errors.detail} />

            <ButtonsBar children={children} submitTitle={submitTitle} />
        </form>
    );
};
