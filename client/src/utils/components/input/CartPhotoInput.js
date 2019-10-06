// @flow
import * as React from 'react';
import {useRef, useState} from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
// $FlowFixMe: do not complain about Yup
import {Input, Icon} from 'antd';
import Label from './Label';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from 'src/back/cart/_data';
import {MEDIA_URL} from 'src/constants';

const {Search} = Input;

type Props = {
    name: string,
    label: string,
};

export default ({name, label}: Props) => {
    const fileInput = useRef(null);
    const onSelect = () => {
        fileInput.current.click();
    };
    const onFileChange = setFieldValue => e => {
        Tools.apiClient(apiUrls.orderImgToUrl, {file: e.target.files[0]}, 'POST')
            .then(resp => {
                const url = MEDIA_URL + resp.path;
                setFieldValue(name, url);
            })
            .catch(console.log);
    };
    const onInternalChange = setFieldValue => e => {
        const {value} = e.target;
        setFieldValue(name, value);
    };
    return (
        <div className={'form-group'}>
            <Label name={name} label={label} />
            <Field name={name}>
                {({field, form}) => {
                    return (
                        <>
                            <input
                                ref={fileInput}
                                onChange={onFileChange(form.setFieldValue)}
                                type="file"
                                className="hide"
                            />
                            <Search
                                placeholder="input search text"
                                onSearch={onSelect}
                                value={field.value}
                                onChange={onInternalChange(form.setFieldValue)}
                                enterButton={<Icon type="file-image" />}
                            />
                        </>
                    );
                }}
            </Field>
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};
