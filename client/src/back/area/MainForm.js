// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls, defaultInputs} from './_data';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

export class Service {
    static async changeRequest(params: Object) {
        return !params.id
            ? await Tools.apiCall(apiUrls.crud, params, 'POST')
            : await Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static async retrieveRequest(id: number) {
        return await Tools.apiCall(apiUrls.crud + id);
    }

    static handleSubmit(id: number, close: Function, onSuccess: Function, onError: Function, setData: Function) {
        return (needToClose: boolean) => (e: Object) => {
            e.preventDefault();
            const params = Tools.formDataToObj(new FormData(e.target));
            return Service.changeRequest(id ? {...params, id} : params)
                .then(resp => {
                    if (!resp.ok) return Promise.reject(resp.data);
                    setData(defaultInputs);
                    needToClose && close();
                    onSuccess({...resp.data, checked: false}, id ? 'update' : 'add');
                })
                .catch(err => onError(Tools.setFormErrors(err)));
        };
    }

    static handleRetrieve(id: number, callback: Function) {
        return !id
            ? callback(defaultInputs)
            : Service.retrieveRequest(id)
                  .then(resp => (resp.ok ? callback(resp.data) : callback(defaultInputs)))
                  .catch(() => callback(defaultInputs));
    }
}

type Props = {
    id: number,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node
};
export default ({id, open: _open, close, onChange, children}: Props) => {
    const [errors, setErrors] = useState({});
    const [data, setData] = useState(defaultInputs);
    const [open, setOpen] = useState(false);

    const handleSubmit = Service.handleSubmit(id, close, onChange, setErrors, setData);

    const afterRetrieve = (open: boolean) => (data: Object) => {
        setData(data);
        setOpen(open);
    };

    const emptyForm = (): boolean => {
        setErrors({});
        setData(defaultInputs);
        return true;
    };

    useEffect(() => {
        emptyForm() && _open ? Service.handleRetrieve(id, afterRetrieve(_open)) : setOpen(_open);
    }, [_open]);

    return (
        <DefaultModal open={open} close={close} title="Area manager">
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
export const Form = ({onSubmit: _onSubmit, children, state, submitTitle = 'Save'}: FormProps) => {
    const [needToClose, setNeedToClose] = useState(true);
    const formElm = useRef(null);
    const firstInputSelector = "[name='uid']";

    const resetAndFocus = form => {
        if (!form) return;
        const firstInput = form.querySelector(firstInputSelector);
        form.reset();
        firstInput && firstInput.focus();
    }; 

    const name = 'area';
    const fieldId = Tools.getFieldId(name);
    const {id, uid, value} = state.data;
    const {errors} = state;

    const errMsg = (name: string): Array<string> => state.errors[name] || [];

    const onSubmit = _onSubmit(needToClose);

    const onClick = e => setNeedToClose(!e.screenY && !e.screenY && !id ? false : true);

    useEffect(() => {
        Tools.isEmpty(errors) && resetAndFocus(formElm.current);
    }, [state]);

    return (
        <form name={name} ref={formElm} onSubmit={onSubmit}>
            <TextInput
                id={fieldId('uid')}
                label="Key"
                value={uid}
                errMsg={errMsg('uid')}
                required={true}
                autoFocus={true}
            />
            <TextInput id={fieldId('value')} label="value" value={value} errMsg={errMsg('value')} required={true} />

            <ErrorMessages errors={errors.detail} alert={true} />

            <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick} />
        </form>
    );
};
