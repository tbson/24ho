// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
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

    static handleSubmit(id: number, onChange: Function, reOpenDialog: boolean, extraParams: Object = {}) {
        return (values: Object, {setErrors}: Object) =>
            Service.changeRequest(id ? {...values, ...extraParams, id} : {...values, ...extraParams}).then(
                ({ok, data}) =>
                    ok
                        ? onChange({...data, checked: false}, id ? 'update' : 'add', reOpenDialog)
                        : setErrors(Tools.setFormErrors(data))
            );
    }
}

type Props = {
    type: number,
    area: number,
    id: number,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({type, area, id, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const firstInputSelector = "[name='uid']";
    const {validate, validationSchema, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [reOpenDialog, setReOpenDialog] = useState(true);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (id: number) =>
        Service.retrieveRequest(id).then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            setInitialValues({...resp.data});
            setOpenModal(true);
        });

    useEffect(() => {
        open ? retrieveThenOpen(id) : setOpenModal(false);
        setReOpenDialog(id ? false : true);
    }, [open]);

    const unit = Tools.deliveryFeeUnitLabel(type);

    const focusFirstInput = () => {
        const firstInput = document.querySelector(`form ${firstInputSelector}`);
        firstInput && firstInput.focus();
    };

    const onClick = (handleSubmit: Function) => () => {
        setReOpenDialog(false);
        focusFirstInput();
        handleSubmit();
    };

    return (
        <DefaultModal open={openModal} close={close} title="Delivery fee manager">
            <Formik
                initialValues={{...initialValues}}
                validate={validate}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange, reOpenDialog, {type, area})}>
                {({errors, handleSubmit}) => (
                    <Form>
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
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
