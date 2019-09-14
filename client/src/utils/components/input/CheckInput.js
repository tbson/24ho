// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
import Label from './Label';

type Props = {
    disabled?: boolean,
    name: string,
    label?: string
};

export default ({name, label, disabled = false}: Props) => {
    const onChange = (setFieldValue: Function) => (e: Object) => setFieldValue(name, !!e.target.checked);
    return (
        <div className="form-group form-check">
            <Field name={name}>
                {({field, form}) => {
                    return (
                        <input
                            type="checkbox"
                            disabled={disabled}
                            id={name}
                            name={name}
                            checked={!!field.value}
                            className="form-check-input"
                            onChange={onChange(form.setFieldValue)}
                        />
                    );
                }}
            </Field>
            <Label name={name} label={label} className="form-check-label no-select" />
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
