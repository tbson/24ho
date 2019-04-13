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
    required?: boolean
};

export default ({name, label, type = 'text', autoFocus = false, required = false}: Props) => {
    return (
        <div className={'form-group'}>
            <Label name={name} label={label} required={required} />
            <Field id={name} name={name} type={type} autoFocus={autoFocus} className="form-control" />
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
