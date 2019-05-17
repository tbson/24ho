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
import TextInput from 'src/utils/components/formik_input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static initialValues = {
        rate: 0,
        buy_rate: 0,
        sell_rate: 0,
        order_rate: 0
    };

    static validationSchema = Yup.object().shape({
        rate: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .integer(ErrMsgs.INTEGER)
            .min(0, ErrMsgs.GT_0),
        sub_delta: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .integer(ErrMsgs.INTEGER),
        order_delta: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .integer(ErrMsgs.INTEGER)
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest(id: number) {
        return id ? Tools.apiCall(apiUrls.crud + id) : Promise.resolve({ok: true, data: Service.initialValues});
    }

    static handleSubmit(id: number, onChange: Function, reOpenDialog: boolean) {
        return (values: Object, {setErrors}: Object) =>
            Service.changeRequest(id ? {...values, id} : values).then(({ok, data}) =>
                ok
                    ? onChange({...data, checked: false}, id ? 'update' : 'add', reOpenDialog)
                    : setErrors(Tools.setFormErrors(data))
            );
    }
}

type Props = {
    id: number,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const firstInputSelector = "[name='uid']";
    const {validationSchema, handleSubmit} = Service;

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
        <DefaultModal open={openModal} close={close} title="Rate manager">
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange, reOpenDialog)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <TextInput name="rate" type="number" label="Mua vào" autoFocus={true} required={true} />
                        <TextInput name="sub_delta" type="number" label="Δ phụ phí" required={true} />
                        <TextInput name="order_delta" type="number" label="Δ order" required={true} />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
