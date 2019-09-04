// @flow
import * as React from 'react';
import {useState} from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
// $FlowFixMe: do not complain about hooks
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import Label from './Label';

export class Service {
    static emptyInput = [null, null];
}

type Props = {
    name: string,
    required?: boolean,
    label?: string
};

export default ({name, label, required = false}: Props) => {
    const {emptyInput} = Service;
    const [value, setValue] = useState(emptyInput);

    const onChange = (setFieldValue: Function) => (dates: Array<Date>) => {
        setFieldValue(name, dates || emptyInput);
        setValue(dates || emptyInput);
    };

    return (
        <div>
            <div>
                <Label name={name} label={label} required={required} />
            </div>
            <div>
                <Field name={name}>
                    {({form}) => {
                        return <DateRangePicker onChange={onChange(form.setFieldValue)} value={value} />;
                    }}
                </Field>
            </div>
        </div>
    );
};
