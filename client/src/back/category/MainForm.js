// @flow
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
// $FlowFixMe: do not complain about formik
import { Formik, Form } from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import { apiUrls } from './_data';
import TextInput from 'src/utils/components/formik_input/TextInput';
import CheckInput from 'src/utils/components/formik_input/CheckInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import SelectInput from 'src/utils/components/formik_input/SelectInput';

export class Service {
    static initialValues = {
        uid: 'uid',
        title: '',
        type: 'article',
        single: false
    };

    static validationSchema = Yup.object().shape({
        title: Yup.string().required(ErrMsgs.REQUIRED),
        type: Yup.string().required(ErrMsgs.REQUIRED),
        single: Yup.string().required(ErrMsgs.REQUIRED)
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ ok: true, data: Service.initialValues });
    }

    static handleSubmit(id: number, onChange: Function, reOpenDialog: boolean) {
        return (values: Object, { setErrors }: Object) =>
            Service.changeRequest(id ? { ...values, id } : values).then(({ ok, data }) =>
                ok
                    ? onChange({ ...data, checked: false }, id ? 'update' : 'add', reOpenDialog)
                    : setErrors(Tools.setFormErrors(data))
            );
    }
}

type Props = {
    id: number,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({ id, open, close, onChange, children, submitTitle = 'Save' }: Props) => {
    const firstInputSelector = "[name='title']";
    const { validationSchema, handleSubmit } = Service;
    const listType = [{ label: "Article", value: "article" }, { label: "Banner", value: "banner", }]

    const [openModal, setOpenModal] = useState(false);
    const [reOpenDialog, setReOpenDialog] = useState(true);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({ ...resp.data });
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
        <DefaultModal open={openModal} close={close} title="Variable manager">
            <Formik
                initialValues={{ ...initialValues }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange, reOpenDialog)}>
                {({ errors, handleSubmit }) => (
                    <Form>
                        <TextInput name="title" label="Title" required={true} autoFocus={true} />
                        <SelectInput name="type" label="Type" options={listType} />
                        <CheckInput name="single" label="Single" />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
