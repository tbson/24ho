// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about hooks
import {Formik, Form} from 'formik';
import {APP} from 'src/constants';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/formik_input/TextInput';
import FileInput from 'src/utils/components/formik_input/FileInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static initialValues = {avatar: '', username: '', email: '', first_name: '', last_name: '', phone: '', company: ''};

    static getProfileRequest() {
        return Tools.apiCall(apiUrls.profile);
    }

    static setProfileRequest(params: Object) {
        return Tools.apiCall(apiUrls.profile, params, 'POST');
    }

    static getProfile(callback: Function) {
        Service.getProfileRequest().then(resp => resp.ok && callback(resp.data));
    }

    static handleSubmit(onChange: Function) {
        const {setProfileRequest} = Service;
        return (values: Object, {setErrors}: Object) =>
            setProfileRequest(values).then(({ok, data}) => {
                ok ? onChange(data) : setErrors(Tools.setFormErrors(data));
            });
    }

    static validate({username, email, first_name, last_name, phone}: Object): Object {
        const errors = {
            username: !username && 'Required',
            email: !email && 'Required',
            first_name: !first_name && 'Required',
            last_name: !last_name && 'Required',
            phone: !phone && 'Required'
        };
        return Tools.removeEmptyKey(errors);
    }

    static prepareUserData(data: Object): Object {
        data = Tools.prepareUserData(data);
        if (!data.avatar) data.avatar = '';
        return data;
    }
}

type Props = {
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({open, close, onChange, children, submitTitle = 'Update'}: Props) => {
    const {validate, handleSubmit, prepareUserData} = Service;

    const [initialValues, setInitialValues] = useState(Service.initialValues);
    const [openModal, setOpenModal] = useState(false);

    const retrieveThenOpen = () =>
        Service.getProfile(profile => {
            setInitialValues(prepareUserData(profile));
            setOpenModal(true);
        });

    useEffect(() => {
        open ? retrieveThenOpen() : setOpenModal(false);
    }, [open]);

    return (
        <DefaultModal open={openModal} close={close} title="Update profile">
            <Formik initialValues={{...initialValues}} validate={validate} onSubmit={handleSubmit(onChange)}>
                {({errors}) => (
                    <Form>
                        <div className="row">
                            {APP !== 'admin' && (
                                <div className="col-md-2">
                                    <FileInput name="avatar" label="" />
                                </div>
                            )}
                            <div className={`col-md-${APP !== 'admin' ? 10 : 12}`}>
                                <TextInput name="username" label="Username" required={true} autoFocus={true} />

                                <TextInput name="email" type="email" label="Email" required={true} />

                                <div className="row">
                                    <div className="col-md-6">
                                        <TextInput name="first_name" label="First name" />
                                    </div>
                                    <div className="col-md-6">
                                        <TextInput name="last_name" label="Last name" />
                                    </div>
                                </div>

                                {APP !== 'admin' && <TextInput name="phone" label="Phone" required={true} />}
                                {APP !== 'admin' && <TextInput name="company" label="Company" />}
                            </div>
                        </div>

                        <FormLevelErrMsg errors={errors.detail} />

                        <ButtonsBar children={children} submitTitle={submitTitle} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
