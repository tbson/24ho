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
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_CART_MAIN_FORM';
    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static initialValues = {
        quantity: 0,
        note: ''
    };

    static validationSchema = Yup.object().shape({
        quantity: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .min(0, ErrMsgs.GT_0)
    });

    static handleSubmit(id: number, onChange: Function) {
        return (values: Object, {setErrors}: Object) => {
            const item = {id, ...values, checked: false};
            onChange(item, id ? 'update' : 'add');
        };
    }
}

type Props = {
    listItem: Array<Object>,
    onChange: Function,
    submitTitle?: string
};
export default ({listItem, onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Mặt hàng hàng';
    const {validationSchema, handleSubmit} = Service;

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);

    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) => {
        const item = listItem.find(item => item.id === id);
        setInitialValues({...item});
        setOpen(true);
        setId(id);
    };

    const handleToggle = ({detail: {open, id}}) => {
        open ? retrieveThenOpen(id) : setOpen(false);
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
            title={Tools.getFormTitle(id, formName)}>
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange)}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <TextInput
                                name="quantity"
                                type="number"
                                label="Số lượng"
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
