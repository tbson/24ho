// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Modal} from 'antd';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_ORDER_CHECK_FORM';
    static toggleForm(open: boolean) {
        Tools.event.dispatch(Service.toggleEvent, {open});
    }

    static initialValues = {
        bols: ''
    };

    static validationSchema = Yup.object().shape({
        bols: Yup.string()
    });
}

type Props = {
    listBol: SelectOptions,
    onChange: Function,
    submitTitle?: string
};
export default ({listBol, onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Kiểm hàng';
    const {validationSchema} = Service;

    const [open, setOpen] = useState(false);
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

    let handleOk = Tools.emptyFunction;

    return (
        <Modal
            destroyOnClose={true}
            visible={open}
            onOk={() => handleOk()}
            onCancel={() => Service.toggleForm(false)}
            okText={submitTitle}
            cancelText="Thoát"
            title={formName}>
            <Formik initialValues={{...initialValues}} validationSchema={validationSchema} onSubmit={onChange}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <SelectInput name="bols" label="Vận đơn có thể chuyển" isMulti={true} options={listBol} />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
