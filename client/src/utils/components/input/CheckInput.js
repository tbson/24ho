// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import ErrorMessages from '../form/ErrorMessages';

type Props = {
    id: string,
    required?: boolean,
    disabled?: boolean,
    errMsg?: Array<string>,
    value?: string,
    placeholder?: string,
    onChange?: Function,
    label: string
};

export default ({
    id,
    required = false,
    disabled = false,
    errMsg = [],
    label,
    value,
    placeholder,
    onChange
}: Props) => {
    const name = id.split('-').pop();
    const className = `form-check-input ${errMsg.length ? 'is-invalid' : ''}`.trim();
    const inputProps = {
        id,
        required,
        disabled,
        label,
        placeholder,
        name,
        className,
        type: 'checkbox',
        defaultValue: value,
        defaultChecked: value,
        placeholder: placeholder || `${label}...`,
        onChange: onChange === 'function' ? onChange : () => {}
    };

    return (
        <div className={`form-group form-check ${name}-field`.trim()}>
            <input {...inputProps} />
            <label htmlFor={id} className={(required ? 'red-dot ' : ' ') + 'form-check-label'}>
                {label}
            </label>
            <ErrorMessages errors={errMsg} />
        </div>
    );
};
