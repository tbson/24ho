// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
// $FlowFixMe: do not complain about hooks
import { Checkbox } from 'antd';
import Label from './Label';

type Props = {
    disabled?: boolean,
    name: string,
    label?: string
};

export default ({name, label, disabled = false}: Props) => {
    const onChange = (setFieldValue: Function) => (e: Object) => setFieldValue(name, !!e.target.checked);
    return (
        <div className="form-group">
            <Field name={name}>
                {({field, form}) => {
                    return (
                        <Checkbox
                            disabled={disabled}
                            id={name}
                            name={name}
                            checked={!!field.value}
                            onChange={onChange(form.setFieldValue)}
                        >{label}</Checkbox>
                    );
                }}
            </Field>
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
