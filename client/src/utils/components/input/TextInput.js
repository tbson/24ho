// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
// $FlowFixMe: do not complain about hooks
import {Input, InputNumber} from 'antd';
import Label from './Label';

type Props = {
    name: string,
    label: string,
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
    onBlur: _onBlur,
    onChange: _onChange
}: Props) => {
    const AbstactInput = type === 'number' ? InputNumber : Input;
    const onBlur = typeof _onBlur === 'function' ? _onBlur : () => {};
    const onChange = setFieldValue => e => {
        let value = e;
        if (typeof e === 'object') value = e.target.value;
        setFieldValue(name, value);
        typeof _onChange === 'function' && _onChange(value);
    };

    return (
        <div className={'form-group'}>
            <Label name={name} label={label} required={required} />
            <Field name={name}>
                {({field, form}) => {
                    return (
                        <AbstactInput
                            id={name}
                            style={{width: '100%'}}
                            type={type}
                            autoFocus={autoFocus}
                            disabled={disabled}
                            onBlur={onBlur}
                            value={field.value}
                            onChange={onChange(form.setFieldValue)}
                        />
                    );
                }}
            </Field>
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
