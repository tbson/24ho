// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
import Label from './Label';

type Props = {
    name: string,
    label?: string,
    type?: string,
    autoFocus?: boolean,
    required?: boolean,
    disabled?: boolean,
    onBlur?: Function
};

export default ({
    name,
    label,
    type = 'text',
    autoFocus = false,
    required = false,
    disabled = false,
    onBlur = () => {}
}: Props) => {
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
                onBlur={onBlur}
            />
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
