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
    required = false
}: Props) => {
    const handleChange = (setFieldValue: Function, isMulti: boolean) => {
        return item => {
            const value = isMulti ? item.map(i => i.value) : item.value;
            setFieldValue(name, value);
        };
    };
    return (
        <div className={'form-group'}>
            <Label name={name} label={label} required={required} />
            <Field name={name}>
                {({field, form}) => {
                    let value;
                    if (isMulti) {
                        value = options.filter(option => (field.value || []).includes(option.value));
                    } else {
                        value = options.find(option => option.value === field.value);
                    }
                    return (
                        <Select
                            defaultValue={value}
                            isMulti={isMulti}
                            isSearchable={true}
                            disabled={disabled}
                            autoFocus={autoFocus}
                            onChange={handleChange(form.setFieldValue, isMulti)}
                            options={options}
                        />
                    );
                }}
            </Field>
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
