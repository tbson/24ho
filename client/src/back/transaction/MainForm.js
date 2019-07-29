// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import Tools from 'src/utils/helpers/Tools';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/formik_input/TextInput';
import SelectInput from 'src/utils/components/formik_input/SelectInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
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
        customer: Yup.number(),
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
    listType: SelectOptions,
    listMoneyType: SelectOptions,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({listCustomer, listType, listMoneyType, close, onChange, children, submitTitle = 'Save'}: Props) => {
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

    return (
        <DefaultModal open={open} close={close} title="Transaction manager">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <TextInput name="amount" type="number" label="Số tiền" required autofocus/>
                        <div className="row">
                            <div className="col">
                                <SelectInput name="type" options={listType} label="Loại giao dịch" required/>
                            </div>
                            <div className="col">
                                <SelectInput name="money_type" options={listMoneyType} label="Loại tiền" required/>
                            </div>
                        </div>
                        <SelectInput name="customer" options={listCustomer} label="Khách hàng" />
                        <TextInput name="note" label="Ghi chú" />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={handleSubmit} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
