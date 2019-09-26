// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
import Label from './Label';
import type {SelectOptions} from 'src/utils/helpers/Tools';
// $FlowFixMe: do not complain about importing node_modules
import Loadable from 'react-loadable';
// $FlowFixMe: do not complain about importing node_modules
import {Select} from 'antd';
/*
const Select = Loadable({
    // $FlowFixMe: do not complain about importing node_modules
    loader: () => import('react-select'),
    loading: () => <div>Loading select...</div>
});
*/
const {Option} = Select;
type Props = {
    name: string,
    label?: string,
    options: SelectOptions,
    blankLabel?: string,
    isMulti?: boolean,
    isClearable?: boolean,
    disabled?: boolean,
    autoFocus?: boolean,
    required?: boolean
};

export default ({
    name,
    label,
    options,
    blankLabel = '',
    autoFocus = false,
    isMulti = false,
    disabled = false,
    isClearable = true,
    required = false
}: Props) => {
    const blankOption = {value: '', label: `--- ${blankLabel} ---`};
    const optionsWithBlankValue = options => {
        if (isMulti || !blankLabel) return options;
        return [blankOption, ...options];
    };

    const children = optionsWithBlankValue(options).map(item => {
        const {value, label} = item;
        return (
            <Option key={value} value={value}>
                {label}
            </Option>
        );
    });

    const handleChange = (setFieldValue: Function) => {
        return item => {
            setFieldValue(name, item);
        };
    };

    return (
        <div className={'form-group'}>
            <Label name={name} label={label} required={required} />
            <Field name={name}>
                {props => {
                    const {field, form} = props;
                    let value = field.value;
                    const renderErrorMessage = () => {
                        if (!form.touched[field.name] || !form.errors[field.name]) return null;
                        return <div className="red">{form.errors[field.name]}</div>;
                    };
                    return (
                        <>
                            <Select
                                showSearch
                                value={value}
                                mode={isMulti ? 'multiple' : 'default'}
                                disabled={disabled}
                                onChange={value => form.setFieldValue(name, value)}
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }>
                                {children}
                            </Select>
                            {renderErrorMessage()}
                        </>
                    );
                }}
            </Field>
        </div>
    );
};
