// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls, defaultInputs, Context} from './_data';
import type {FormState, SelectOptions} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/formik_input/TextInput';
import CheckInput from 'src/utils/components/formik_input/CheckInput';
import SelectInput from 'src/utils/components/formik_input/SelectInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static initialValues = {
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        groups: [],
        is_sale: false,
        is_cust_care: false,
        is_lock: false
    };

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ok: true, data: Service.initialValues});
    }

    static handleSubmit(id: number, onChange: Function, reOpenDialog: boolean) {
        return (values: Object, {setErrors}: Object) =>
            Service.changeRequest(id ? {...values, id} : values).then(({ok, data}) =>
                ok
                    ? onChange({...data, checked: false}, id ? 'update' : 'add', reOpenDialog)
                    : setErrors(Tools.setFormErrors(data))
            );
    }

    static validate({username, email, first_name, last_name, groups}: Object): Object {
        const errors = {
            username: !username && 'Required',
            email: !email && 'Required',
            first_name: !first_name && 'Required',
            last_name: !last_name && 'Required',
            groups: (!groups || !groups.length) && 'Required'
        };
        return Tools.removeEmptyKey(errors);
    }
}

type FormProps = {
    id: number,
    listGroup: SelectOptions,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, listGroup, open, close, onChange, children, submitTitle = 'Save'}: FormProps) => {
    const firstInputSelector = "[name='email']";

    const {validate, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [reOpenDialog, setReOpenDialog] = useState(true);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...Tools.prepareUserData(resp.data), password: ''});
            setOpenModal(true);
        });

    useEffect(() => {
        open ? retrieveThenOpen(id) : setOpenModal(false);
        setReOpenDialog(true);
    }, [open]);

    const focusFirstInput = () => {
        const firstInput = document.querySelector(`form ${firstInputSelector}`);
        firstInput && firstInput.focus();
    };

    const onClick = (handleSubmit: Function) => () => {
        setReOpenDialog(false);
        focusFirstInput();
        handleSubmit();
    };

    return (
        <DefaultModal open={openModal} close={close} title="Staff manager">
            <Formik
                initialValues={{...initialValues}}
                validate={validate}
                onSubmit={handleSubmit(id, onChange, reOpenDialog)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <div className="row">
                            <div className="col">
                                <TextInput name="email" type="email" label="Email" required={true} autoFocus={true} />
                            </div>
                            <div className="col">
                                <TextInput name="username" label="Tên đăng nhập" required={true} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <TextInput name="last_name" label="Họ và tên lót" required={true} />
                            </div>
                            <div className="col">
                                <TextInput name="first_name" label="Tên" required={true} />
                            </div>
                        </div>
                        <TextInput name="password" type="password" label="Password" />
                        <SelectInput isMulti={true} name="groups" label="Quyền" options={listGroup} required={true} />
                        <CheckInput name="is_sale" label="Nhân viên mua hàng" />
                        <CheckInput name="is_cust_care" label="Chăm sóc khách hàng" />
                        <CheckInput name="is_lock" label="Khoá" />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
