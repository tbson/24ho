// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import ErrorMessages from './ErrorMessages';

type Props = {
    id: string,
    type: string,
    label: string,
    errorMessages: Array<string>,
    value?: string,
    placeholder?: string,
    required: boolean,
    disabled?: boolean,
    autoFocus: boolean,
    onChange?: Function
};

export default class Input extends React.Component<Props> {
    static defaultProps = {
        type: 'text',
        required: false,
        disabled: false,
        autoFocus: false,
        errorMessages: []
    };

    render() {
        const {id, label, value, placeholder, onChange, errorMessages, required} = this.props;
        const name = id.split('-').pop();
        const className = `form-control ${errorMessages.length ? 'is-invalid' : ''}`.trim();
        const inputProps = {
            ...this.props,
            name,
            className,
            defaultValue: value,
            placeholder: placeholder || `${label}...`
        };
        if (typeof onChange === 'function') {
            inputProps.onChange = onChange;
        }

        delete inputProps.errorMessages;
        delete inputProps.value;

        return (
            <div className={`form-group ${name}-field`.trim()}>
                <label htmlFor={id} className={required ? 'red-dot' : ''}>
                    {label}
                </label>
                <input {...inputProps} />
                <ErrorMessages errors={errorMessages} />
            </div>
        );
    }
}
