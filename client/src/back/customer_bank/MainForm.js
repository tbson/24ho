// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
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
    static toggleEvent = 'TOGGLE_CUSTOMER_BANK_MAIN_FORM';
    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static initialValues = {
        bank_name: '',
        account_name: '',
        account_number: ''
    };

    static validationSchema = Yup.object().shape({
        bank_name: Yup.string().required(ErrMsgs.REQUIRED),
        account_name: Yup.string().required(ErrMsgs.REQUIRED),
        account_number: Yup.string().required(ErrMsgs.REQUIRED)
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
    onChange: Function,
    submitTitle?: string
};
export default ({onChange, submitTitle = 'Save'}: Props) => {
    const formName = 'Ngân hàng';
    const {validationSchema, handleSubmit} = Service;

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
            setOpen(true);
            setId(id);
        });

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
                            <TextInput name="bank_name" label="Tên ngân hàng" autoFocus={true} required={true} />
                            <TextInput name="account_name" label="Tên tài khoản" required={true} />
                            <TextInput name="account_number" label="Số tài khoản" required={true} />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
