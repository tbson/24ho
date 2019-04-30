// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
import Tools from 'src/utils/helpers/Tools';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/formik_input/TextInput';
import SelectInput from 'src/utils/components/formik_input/SelectInput';
import CheckInput from 'src/utils/components/formik_input/CheckInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static initialValues = {
        address: null,
        note: '',
        count_check: false,
        wooden_box: false,
        shockproof: false
    };

    static validate({quantity}: Object): Object {
        const errors = {};
        return Tools.removeEmptyKey(errors);
    }

    static getAddressLabel(id: number, listAddress: SelectOptions): string {
        const address = listAddress.find(item => item.value === id);
        return address ? address.label : '';
    }

    static handleSubmit(id: number, listAddress: SelectOptions, onChange: Function) {
        return (values: Object) => {
            values.address_title = Service.getAddressLabel(values.address, listAddress);
            onChange({[id]: values});
        };
    }
}

type Props = {
    id: number,
    listOrder: Object,
    listAddress: SelectOptions,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({id, listOrder, listAddress, open, close, onChange, children, submitTitle = 'Save'}: Props) => {
    const firstInputSelector = "[name='note']";
    const {validate, handleSubmit} = Service;

    const [openModal, setOpenModal] = useState(false);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    useEffect(() => {
        setOpenModal(open);
        setInitialValues(listOrder[id] || Service.initialValues);
    }, [open]);

    const focusFirstInput = () => {
        const firstInput = document.querySelector(`form ${firstInputSelector}`);
        firstInput && firstInput.focus();
    };

    const onClick = (handleSubmit: Function) => () => {
        focusFirstInput();
        handleSubmit();
    };

    return (
        <DefaultModal open={openModal} close={close} title="Cart order manager">
            <Formik
                initialValues={{...initialValues}}
                validate={validate}
                onSubmit={handleSubmit(id, listAddress, onChange)}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <SelectInput name="address" label="Address" options={listAddress} required={true} />
                        <TextInput name="note" label="Note" autoFocus={true} />
                        <CheckInput name="count_check" label="Kiểm đếm" />
                        <CheckInput name="wooden_box" label="Đóng gỗ" />
                        <CheckInput name="shockproof" label="Chống sốc" />
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick(handleSubmit)} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
