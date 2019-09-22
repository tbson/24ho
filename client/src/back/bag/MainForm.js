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
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import SelectInput from 'src/utils/components/input/SelectInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static firstInputSelector = "[name='uid']";

    static focusFirstInput() {
        const firstInput = document.querySelector(`form ${Service.firstInputSelector}`);
        firstInput && firstInput.focus();
    }

    static initialValues = {
        area: 0
    };

    static validationSchema = Yup.object().shape({
        area: Yup.number().required(ErrMsgs.REQUIRED)
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number, initialValues: Object) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ok: true, data: initialValues});
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
    areaOptions: SelectOptions,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, areaOptions, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    if (!areaOptions.length) return null;

    const {validationSchema, handleSubmit} = Service;
    const [openModal, setOpenModal] = useState(false);
    const _initialValues = {
        ...Service.initialValues,
        area: areaOptions[0].value
    };
    const [initialValues, setInitialValues] = useState(_initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id, _initialValues).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
            setOpenModal(true);
        });

    useEffect(() => {
        open ? retrieveThenOpen(id) : setOpenModal(false);
    }, [open]);

    return (
        <DefaultModal open={openModal} close={close} title="Quản lý bao hàng">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <SelectInput name="area" label="Area" options={areaOptions} />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={handleSubmit} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
