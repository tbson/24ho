// @flow
import * as React from 'react';
import {useState, useEffect, useContext, useRef} from 'react';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls, defaultInputs, Context} from './_data';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
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
            params.customer = Tools.getStorageObj('auth').id;
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
    const {listArea} = useContext(Context);

    const handleSubmit = Service.handleSubmit(id, close, onChange, setErrors, setData);

    const afterRetrieve = (open: boolean) => (data: Object) => {
        if (!data.id) data.area = listArea[0].value;
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
        <DefaultModal open={open} close={close} title="Address manager">
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
    const {listArea} = useContext(Context);

    const resetAndFocus = form => {
        if (!form) return;
        const firstInput = form.querySelector(firstInputSelector);
        form.reset();
        firstInput && firstInput.focus();
    }; 

    const name = 'address';
    const fieldId = Tools.getFieldId(name);
    const {id, area, title, phone, fullname} = state.data;
    const {errors} = state;

    const errMsg = (name: string): Array<string> => state.errors[name] || [];

    const onSubmit = _onSubmit(needToClose);

    const onClick = e => setNeedToClose(!e.screenY && !e.screenY && !id ? false : true);

    useEffect(() => {
        Tools.isEmpty(errors) && resetAndFocus(formElm.current);
    }, [state]);

    return (
        <form name={name} ref={formElm} onSubmit={onSubmit}>
            <SelectInput
                isMulti={false}
                id={fieldId('area')}
                label="Area"
                options={listArea}
                value={area}
                required={true}
            />

            <TextInput
                id={fieldId('title')}
                label="Address"
                value={title}
                errMsg={errMsg('title')}
                required={true}
            />
            <TextInput id={fieldId('phone')} label="Phone" value={phone} errMsg={errMsg('phone')} />
            <TextInput id={fieldId('fullname')} label="Fullname" value={fullname} errMsg={errMsg('fullname')} />

            <ErrorMessages errors={errors.detail} alert={true} />

            <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick} />
        </form>
    );
};
