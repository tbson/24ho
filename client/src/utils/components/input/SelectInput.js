// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
import Label from './Label';
import type {SelectOptions} from 'src/utils/helpers/Tools';
// $FlowFixMe: do not complain about importing node_modules
import Loadable from 'react-loadable';
const Select = Loadable({
    // $FlowFixMe: do not complain about importing node_modules
    loader: () => import('react-select'),
    loading: () => <div>Loading select...</div>
});

type Props = {
    name: string,
    label?: string,
    options: SelectOptions,
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
    autoFocus = false,
    isMulti = false,
    disabled = false,
    isClearable = true,
    required = false
}: Props) => {
    const handleChange = (setFieldValue: Function, isMulti: boolean) => {
        return item => {
            const value = isMulti ? item.map(i => i.value) : item?.value;
            setFieldValue(name, value);
        };
    };
    return (
        <div className={'form-group'}>
            <Label name={name} label={label} required={required} />
            <Field name={name}>
                {props => {
                    const {field, form} = props;
                    let value;
                    if (isMulti) {
                        value = options.filter(option => (field.value || []).includes(option.value));
                    } else {
                        value = options.find(option => option.value === field.value);
                    }
                    const renderErrorMessage = () => {
                        if (!form.touched[field.name] || !form.errors[field.name]) return null;
                        return <div className="red">{form.errors[field.name]}</div>;
                    };
                    return (
                        <>
                            <Select
                                className="select-input"
                                value={value}
                                isMulti={isMulti}
                                isSearchable={true}
                                isClearable={isClearable}
                                disabled={disabled}
                                autoFocus={autoFocus}
                                onChange={handleChange(form.setFieldValue, isMulti)}
                                options={options}
                            />
                            {renderErrorMessage()}
                        </>
                    );
                }}
            </Field>
        </div>
    );
};
