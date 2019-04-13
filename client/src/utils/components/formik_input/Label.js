// @flow
import * as React from 'react';

type labelProps = {
    name: string,
    label?: string,
    required?: boolean
};
export default ({name, label, required}: labelProps) => {
    if (!label) return null;
    return (
        <label htmlFor={name} className={required ? 'red-dot' : ''}>
            {label}
        </label>
    );
};
