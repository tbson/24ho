// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/formik_input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static initialValues = {
        note: ''
    };

    static validate({quantity}: Object): Object {
        const errors = {};
        return Tools.removeEmptyKey(errors);
    }

    static handleSubmit(id: number, onChange: Function) {
        return (values: Object) => {
            onChange({[id]: values});
        };
    }
}

type Props = {
    id: number,
    listOrder: Object,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, listOrder, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const firstInputSelector = "[name='note']";
    const {validate, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    useEffect(() => {
        setOpenModal(open);
        setInitialValues(listOrder[id] || Service.initialValues);
    }, [open]);

    const focusFirstInput = () => {
        const firstInput = document.querySelector(`form ${firstInputSelector}`);
        firstInput && firstInput.focus();
    };

    const onClick = (handleSubmit: Function) => () => {
        focusFirstInput();
        handleSubmit();
    };

    return (
        <DefaultModal open={openModal} close={close} title="Cart order manager">
            <Formik initialValues={{...initialValues}} validate={validate} onSubmit={handleSubmit(id, onChange)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <TextInput name="note" label="Note" autoFocus={true} />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
