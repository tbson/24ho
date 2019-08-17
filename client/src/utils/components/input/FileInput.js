// @flow
import * as React from 'react';
import {useState} from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
import Tools from 'src/utils/helpers/Tools';
import defaultAvatar from 'src/assets/images/default-avatar.svg';
import Label from './Label';

type Props = {
    name: string,
    label?: string,
    required?: boolean
};

export default ({name, label, required = false}: Props) => {
    const onChange = (setFieldValue: Function) => {
        return (e: Object) => setFieldValue(name, e.currentTarget.files[0]);
    };

    return (
        <div className={'form-group'}>
            <Field name={name}>
                {({field, form}) => {
                    const url = typeof field.value === 'object' ? URL.createObjectURL(field.value) : field.value;
                    return (
                        <>
                            <Label name={name} label={label} required={required} />
                            <div>
                                <img src="" style={{width: '100%', maxWidth: 300}} />
                            </div>
                            <Preview url={url} />
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                name={name}
                                className="form-control"
                                placeholder="Select file"
                                onChange={onChange(form.setFieldValue)}
                            />
                        </>
                    );
                }}
            </Field>
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};

type previewProps = {
    url?: string
};
const Preview = ({url}: previewProps) => {
    return (
        <div>
            <img src={url || defaultAvatar} style={{width: '100%', maxWidth: 300}} />
        </div>
    );
};
