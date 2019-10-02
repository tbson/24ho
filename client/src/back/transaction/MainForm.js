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
import type {SelectOptions} from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_TRANSACTION_MAIN_FORM';

    static initialValues = {
        customer: '',
        amount: '',
        type: '',
        money_type: '',
        note: ''
    };

    static validationSchema = Yup.object().shape({
        amount: Yup.number().required(ErrMsgs.REQUIRED),
        type: Yup.number().required(ErrMsgs.REQUIRED),
        money_type: Yup.number().required(ErrMsgs.REQUIRED),
        customer: Yup.number().required(ErrMsgs.REQUIRED),
        note: Yup.string()
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

    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }
}

type Props = {
    listCustomer: SelectOptions,
    listBank: SelectOptions,
    listType: SelectOptions,
    listMoneyType: SelectOptions,
    onChange: Function,
    submitTitle?: string
};
export default ({
    listCustomer,
    listBank,
    listType,
    listMoneyType,
    onChange,
    submitTitle = 'Save'
}: Props) => {
    const formName = 'Giao dịch';
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
                {({errors, handleSubmit, values}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <SelectInput name="customer" options={listCustomer} label="Khách hàng" required/>
                            <div className="row">
                                <div className="col">
                                    <SelectInput name="type" options={listType} label="Loại giao dịch" required />
                                </div>
                                <div className="col">
                                    <SelectInput name="money_type" options={listMoneyType} label="Loại tiền" required />
                                </div>
                            </div>
                            <TextInput name="amount" type="number" label="Số tiền" required autofocus />
                            {values.money_type === 2 && (
                                <SelectInput name="bank" options={listBank} label="Ngân hàng" />
                            )}
                            <TextInput name="note" label="Ghi chú" />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
