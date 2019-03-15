// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import ErrorMessages from '../form/ErrorMessages';

type Props = {
    id: string,
    type?: string,
    required?: boolean,
    disabled?: boolean,
    autoFocus?: boolean,
    errMsg?: Array<string>,
    value?: string,
    placeholder?: string,
    onChange?: Function,
    label: string
};

export default ({
    id,
    type = 'text',
    required = false,
    disabled = false,
    autoFocus = false,
    errMsg = [],
    label,
    value,
    placeholder,
    onChange
}: Props) => {
    const name = id.split('-').pop();
    const className = `form-control ${errMsg.length ? 'is-invalid' : ''}`.trim();
    const inputProps = {
        id,
        type,
        required,
        disabled,
        autoFocus,
        label,
        placeholder,
        name,
        className,
        defaultValue: value,
        placeholder: placeholder || `${label}...`,
        onChange: onChange === 'function' ? onChange : () => {}
    };

    return (
        <div className={`form-group ${name}-field`.trim()}>
            <label htmlFor={id} className={required ? 'red-dot' : ''}>
                {label}
            </label>
            <input {...inputProps} />
            <ErrorMessages errors={errMsg} />
        </div>
    );
};
