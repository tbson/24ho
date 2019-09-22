// @flow
import * as React from 'react';
import {useState} from 'react';
// $FlowFixMe: do not complain about importing
import {Input} from 'antd';
let inputTimeout;

type Props = {
    onChange: Function,
    clearAfterSet?: boolean,
    className?: string,
    placeholder?: string
};
export default ({onChange, clearAfterSet = false, placeholder = '', className = 'form-control'}: Props) => {
    const [value, setValue] = useState('');
    const handleChange = e => {
        const value = e.target.value;
        setValue(value);

        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => {
            onChange(value);
            clearAfterSet && setValue('');
        }, 500);
    };
    return <Input value={value} onChange={handleChange} placeholder={placeholder} />;
};
