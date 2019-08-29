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
    static toggleEvent = 'TOGGLE_ORDER_APPROVE_FORM';

    static initialValues = {
        sale: ''
    };

    static validationSchema = Yup.object().shape({
        sale: Yup.string().required(ErrMsgs.REQUIRED)
    });

    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }
}

type Props = {
    listSale: SelectOptions,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({listSale, close, onChange, children, submitTitle = 'Save'}: Props) => {
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
        <DefaultModal open={open} close={close} title="Nhân viên mua hàng">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={values => onChange(values.sale)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <SelectInput name="sale" label="Nhân viên mua hàng" required={true} options={listSale} />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={handleSubmit} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
