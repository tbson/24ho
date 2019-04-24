// @flow
import * as React from 'react';
import {useState, useEffect, useContext, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls, Context} from './_data';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/formik_input/TextInput';
import SelectInput from 'src/utils/components/formik_input/SelectInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static initialValues = {
        title: '',
        area: null,
        phone: '',
        fullname: ''
    };

    static validate({area, title}: Object): Object {
        const errors = {
            title: !title && 'Required',
            area: !area && 'Required'
        };
        return Tools.removeEmptyKey(errors);
    }

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
}

type Props = {
    id: number,
    listArea: SelectOptions,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, listArea, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const firstInputSelector = "[name='title']";
    const {validate, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [reOpenDialog, setReOpenDialog] = useState(true);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
            setOpenModal(true);
        });

    useEffect(() => {
        open ? retrieveThenOpen(id) : setOpenModal(false);
        setReOpenDialog(id ? false : true);
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
        <DefaultModal open={openModal} close={close} title="Address manager">
            <Formik
                initialValues={{...initialValues}}
                validate={validate}
                onSubmit={handleSubmit(id, onChange, reOpenDialog)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <TextInput name="title" label="Title" autoFocus={true} required={true} />
                        <SelectInput name="area" label="Area" options={listArea} />
                        <TextInput name="phone" label="Phone" required={true} />
                        <TextInput name="fullname" label="Fullname" required={true} />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
