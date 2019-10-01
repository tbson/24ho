// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Modal} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from '../_data';
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_BOL_EXPORT_FORM';
    static toggleForm(open: boolean) {
        Tools.event.dispatch(Service.toggleEvent, {open});
    }

    static initialValues = {
        vnd_sub_fee: 0,
        note: ''
    };

    static validationSchema = Yup.object().shape({
        vnd_sub_fee: Yup.number().required(ErrMsgs.REQUIRED),
        note: Yup.string()
    });

    static handleSubmit(onChange: Function, closeOnSubmit: boolean, ids: Array<number>) {
        return (values: Object) =>
            Tools.apiClient(apiUrls.export, {...values, ids: ids.join(',')}).then(resp => {
                closeOnSubmit && Service.toggleForm(false);
                onChange();
            });
    }
}

type Props = {
    ids: Array<number>,
    onChange: Function,
    closeOnSubmit?: boolean
};
export default ({onChange, closeOnSubmit = true, ids}: Props) => {
    const formName = 'Xuất hàng';
    const {validationSchema, handleSubmit} = Service;

    const [open, setOpen] = useState(false);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const handleToggle = ({detail: {open}}) => setOpen(open);

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
            okText="Xuất"
            cancelText="Thoát"
            title="Xuất hàng">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(onChange, closeOnSubmit, ids)}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <TextInput
                                name="vnd_sub_fee"
                                type="number"
                                label="Phí giao hàng VND"
                                autoFocus={true}
                                required={true}
                            />
                            <TextInput name="note" label="Ghi chú" />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
