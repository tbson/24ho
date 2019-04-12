// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';

type Props = {
    name: string,
    label: string,
    type?: string,
    autoFocus?: boolean,
    required?: boolean
};

export default ({name, label, type = 'text', autoFocus = false, required = false}: Props) => {
    return (
        <div className={'form-group'}>
            <label htmlFor={name} className={required ? 'red-dot' : ''}>
                {label}
            </label>
            <Field id={name} name={name} type={type} autoFocus={autoFocus} className="form-control" />
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
