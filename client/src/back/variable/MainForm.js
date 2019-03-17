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
    static async changeRequest(params: Object) {
        return !params.id
            ? await Tools.apiCall(apiUrls.crud, params, 'POST')
            : await Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static async retrieveRequest(id: number) {
        return await Tools.apiCall(apiUrls.crud + id);
    }

    static handleSubmit(id: number, onSuccess: Function, onError: Function) {
        return (e: Object) => {
            e.preventDefault();
            const params = Tools.formDataToObj(new FormData(e.target));
            return Service.changeRequest(id ? {...params, id} : params)
                .then(resp =>
                    resp.ok
                        ? onSuccess({...resp.data, checked: false}, id ? 'update' : 'add')
                        : Promise.reject(resp.data)
                )
                .catch(err => onError(Tools.setFormErrors(err)));
        };
    }

    static handleRetrieve(id: number, callback: Function) {
        return !id
            ? callback({})
            : Service.retrieveRequest(id)
                  .then(resp => (resp.ok ? callback(resp.data) : callback({})))
                  .catch(() => callback({}));
    }
}

type Props = {
    id: number,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node
};
export default ({id, open, close, onChange, children}: Props) => {
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});
    const [openModal, setOpenModal] = useState(false);

    const handleSubmit = Service.handleSubmit(id, onChange, setErrors);

    useEffect(() => {
        setErrors({});
        setData({});
        open
            ? Service.handleRetrieve(id, data => {
                  setData(data);
                  setOpenModal(open);
              })
            : setOpenModal(open);
    }, [open]);

    return (
        <DefaultModal open={openModal} close={close} title="Variable manager">
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
export const Form = ({onSubmit, children, state, submitTitle = 'Save'}: FormProps) => {
    const name = 'variable';
    const id = Tools.getFieldId(name);
    const {uid, value} = state.data;
    const {errors} = state;

    const errMsg = (name: string): Array<string> => state.errors[name] || [];
    return (
        <form name={name} onSubmit={onSubmit}>
            <TextInput id={id('uid')} label="Key" value={uid} errMsg={errMsg('uid')} required={true} autoFocus={true} />
            <TextInput id={id('value')} label="value" value={value} errMsg={errMsg('value')} required={true} />

            <ErrorMessages errors={errors.detail} />

            <ButtonsBar children={children} submitTitle={submitTitle} />
        </form>
    );
};
