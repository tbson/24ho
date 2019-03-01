// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import RawSelectInput from './RawSelectInput';
import type {DropdownItemType} from 'src/utils/types/CommonTypes';

type Props = {
    options: Array<DropdownItemType>,
    isMulti: boolean,

    id: string,
    type: string,
    label: string,
    errorMessage: string,
    value?: any,
    placeholder?: string,
    required?: boolean,
    disabled?: boolean,
    autoFocus?: boolean,
    onChange?: Function
};

type States = {
    value: string,
    dataLoaded: boolean
};

export default class Input extends React.Component<Props, States> {
    static defaultProps = {
        type: 'text',
        required: false,
        disabled: false,
        autoFocus: false,
        errorMessage: ''
    };

    state = {
        value: '',
        dataLoaded: false
    };

    onChange = (value: string) => {
        console.log('value:', value);
        this.setState({value}, () => {
            console.log('onChange:', this.state.value);
        });
    };

    componentDidMount() {
        this.setState({value: this.props.value, dataLoaded: true});
    }

    render() {
        const {value, dataLoaded} = this.state;
        if (!dataLoaded) return null;

        const {id, label, options, isMulti, placeholder, onChange, errorMessage, required} = this.props;
        const name = id.split('-').pop();
        const className = `form-control ${errorMessage ? 'is-invalid' : ''}`.trim();
        const selectProps = {options, value, isMulti};
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

        delete inputProps.errorMessage;
        delete inputProps.value;
        delete inputProps.isMulti;

        return (
            <div className={`form-group ${name}-field`.trim()}>
                <input {...inputProps} type="hidden" />
                <label htmlFor={id} className={required ? 'red-dot' : ''}>
                    {label}
                </label>
                <RawSelectInput {...selectProps} onChange={value => this.setState({value})} />
                <div className="invalid-feedback">{errorMessage}</div>
            </div>
        );
    }
}
