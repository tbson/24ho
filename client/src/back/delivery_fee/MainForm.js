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
    static toggleEvent = 'TOGGLE_DELIVERY_FEE_MAIN_FORM';
    static toggleForm(open: boolean, id: number = 0) {
        Tools.event.dispatch(Service.toggleEvent, {open, id});
    }

    static initialValues = {
        start: 0,
        stop: 0,
        vnd_unit_price: 0
    };

    static COMPARE_ERROR = {
        start: 'From amount must to larger than 0 and smaller than To amount',
        stop: 'From amount must to larger than 0 and smaller than To amount'
    };

    static validate({start, stop, vnd_unit_price}: Object): Object {
        return start > stop ? {start: ErrMsgs.RANGE} : {};
    }

    static validationSchema = Yup.object().shape({
        start: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .min(0, ErrMsgs.GT_0),
        stop: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .min(0, ErrMsgs.GT_0),
        vnd_unit_price: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .integer(ErrMsgs.INTEGER)
            .min(0, ErrMsgs.GT_0)
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ok: true, data: Service.initialValues});
    }

    static handleSubmit(id: number, onChange: Function, extraParams: Object = {}) {
        return (values: Object, {setErrors}: Object) =>
            Service.changeRequest(id ? {...values, ...extraParams, id} : {...values, ...extraParams}).then(
                ({ok, data}) =>
                    ok
                        ? onChange({...data, checked: false}, id ? 'update' : 'add')
                        : setErrors(Tools.setFormErrors(data))
            );
    }
}

type Props = {
    type: number,
    area: number,
    onChange: Function,
    submitTitle?: string
};
export default ({type, area, onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Phí vận chuyển';
    const {validate, validationSchema, handleSubmit} = Service;

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

    const unit = Tools.deliveryFeeUnitLabel(type);

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
                validate={validate}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange, {type, area})}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <TextInput
                                name="start"
                                type="number"
                                label={`Từ (${unit})`}
                                autoFocus={true}
                                required={true}
                            />
                            <TextInput name="stop" type="number" label={`Đến (${unit})`} required={true} />
                            <TextInput name="vnd_unit_price" type="number" label="Phí (VND)" required={true} />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
