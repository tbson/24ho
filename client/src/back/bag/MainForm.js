// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/formik_input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import SelectInput from 'src/utils/components/formik_input/SelectInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static firstInputSelector = "[name='uid']";

    static focusFirstInput() {
        const firstInput = document.querySelector(`form ${Service.firstInputSelector}`);
        firstInput && firstInput.focus();
    }

    static initialValues = {
        area: 0,
    };

    static validationSchema = Yup.object().shape({
        area: Yup.number().required(ErrMsgs.REQUIRED),
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ok: true, data: Service.initialValues});
    }

    static handleSubmit(id: number, onChange: Function) {
        return (values: Object, {setErrors}: Object) =>
            Service.changeRequest(id ? {...values, id} : values).then(({ok, data}) =>
                ok ? onChange({...data, checked: false}, id ? 'update' : 'add') : setErrors(Tools.setFormErrors(data))
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
    const {validationSchema, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
            setOpenModal(true);
        });

    useEffect(() => {
        open ? retrieveThenOpen(id) : setOpenModal(false);
    }, [open]);

    return (
        <DefaultModal open={openModal} close={close} title="Variable manager">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <SelectInput name="area" label="Area" options={listArea} />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={handleSubmit} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};