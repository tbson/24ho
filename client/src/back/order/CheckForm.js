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
import SelectInput from 'src/utils/components/input/SelectInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_VARIABLE_CHECK_FORM';

    static initialValues = {
        bols: ''
    };

    static validationSchema = Yup.object().shape({
        bols: Yup.string()
    });

    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }
}

type Props = {
    listBol: SelectOptions,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({listBol, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const {validationSchema} = Service;

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const handleToggle = ({detail: {open}}) => {
        setOpen(open);
    };

    useEffect(() => {
        Tools.event.listen(Service.toggleEvent, handleToggle);
        return () => {
            Tools.event.remove(Service.toggleEvent, handleToggle);
        };
    }, []);

    return (
        <DefaultModal open={open} close={close} title="Variable manager">
            <Formik initialValues={{...initialValues}} validationSchema={validationSchema} onSubmit={onChange}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <SelectInput name="bols" label="Vận đơn có thể chuyển" isMulti={true} options={listBol} />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar
                            children={children}
                            submitTitle={submitTitle}
                            onClick={handleSubmit}
                        />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
