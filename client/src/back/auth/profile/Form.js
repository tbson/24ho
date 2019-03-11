// @flow
// $FlowFixMe: do not complain about hooks
import {useState, useEffect} from 'react';
import * as React from 'react';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

export class Service {
    static async getProfileRequest() {
        return await Tools.apiCall(apiUrls.profile);
    }

    static async setProfileRequest(params: Object) {
        return await Tools.apiCall(apiUrls.profile, params, 'POST');
    }

    static getProfile(callback: Function) {
        Service.getProfileRequest().then(resp => resp.ok && callback(resp.data));
    }

    static handleSubmit(onSuccess: Function, onError: Function) {
        return async (e: Object) => {
            e.preventDefault();
            const params = Tools.formDataToObj(new FormData(e.target));
            const r = await Service.setProfileRequest(params);
            r.ok ? onSuccess(r.data) : onError(Tools.setFormErrors(r.data));
        };
    }
}

type Props = {
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node
};
export default ({open, close, onChange, children}: Props) => {
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        setErrors({});
        setData({});
        open
            ? Service.getProfile(profile => {
                  setData(profile);
                  setOpenModal(open);
              })
            : setOpenModal(open);
    }, [open]);

    return (
        <DefaultModal open={openModal} close={close} title="Update profile">
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
export const Form = ({onSubmit, children, state, submitTitle = 'Update'}: FormProps) => {
    const name = 'reset-password';
    const id = Tools.getFieldId(name);
    const {errors, data} = state;

    const errorMessages = (name: string): Array<string> => state.errors[name] || [];
    return (
        <form name={name} onSubmit={onSubmit}>
            <TextInput id={id('username')} label="Username" value={data.username} required={true} autoFocus={true} />

            <TextInput id={id('email')} type="email" label="Email" value={data.email} required={true} />

            <div className="row">
                <div className="col-md-6">
                    <TextInput id={id('first_name')} label="First name" value={data.first_name} />
                </div>
                <div className="col-md-6">
                    <TextInput id={id('last_name')} label="Last name" value={data.last_name} />
                </div>
            </div>

            <ErrorMessages errors={errors.detail} />

            <ButtonsBar children={children} submitTitle={submitTitle} />
        </form>
    );
};
