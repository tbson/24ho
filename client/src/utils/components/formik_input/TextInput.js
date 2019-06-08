// @flow
import * as React from 'react';
import {useContext} from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
import Label from './Label';
import {FormContext} from 'src/utils/components/formik_input/Contexes';

type Props = {
    name: string,
    label?: string,
    type?: string,
    autoFocus?: boolean,
    required?: boolean,
    disabled?: boolean,
    onBlur?: Function,
    onChange?: Function
};

export default ({
    name,
    label,
    type = 'text',
    autoFocus = false,
    required = false,
    disabled = false,
    onBlur,
    onChange
}: Props) => {
    const {setFieldValue} = useContext(FormContext);
    const events = {};
    if (typeof onBlur === 'function') events.onBlur = onBlur;
    if (typeof onChange === 'function' && typeof setFieldValue === 'function') {
        events.onChange = e => {
            const {value} = e.target;
            setFieldValue(name, e.target.value);
            onChange(value);
        };
    }
    return (
        <div className={'form-group'}>
            <Label name={name} label={label} required={required} />
            <Field
                id={name}
                name={name}
                type={type}
                autoFocus={autoFocus}
                disabled={disabled}
                className="form-control"
                {...events}
            />
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
