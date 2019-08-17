// @flow
import * as React from 'react';

type labelProps = {
    name: string,
    label?: string,
    className?: string,
    required?: boolean
};
export default ({name, label, className = '', required}: labelProps) => {
    if (!label) return null;
    return (
        <label htmlFor={name} className={(required ? 'red-dot ' : ' ') + className}>
            {label}
        </label>
    );
};
