// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about importing node_modules
import {Button, Row, Col} from 'antd';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import type {ObjResp} from 'src/utils/helpers/Tools';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import TextInput from 'src/utils/components/input/TextInput';

export class Service {
    static initialValues = {username: '', password: ''};

    static request(params: Object): Promise<ObjResp> {
        return Tools.apiCall(apiUrls.auth, params, 'POST');
    }

    static handleSubmit(onChange: Function) {
        const {request} = Service;

        return (values: Object, {setErrors}: Object) =>
            request(values).then(({ok, data}) => {
                ok ? onChange(data) : setErrors(Tools.setFormErrors(data));
            });
    }

    static validate(values: Object): Object {
        const errors = {
            username: !values.username && 'Required',
            password: !values.password && 'Required'
        };
        return Tools.removeEmptyKey(errors);
    }
}

type Props = {
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({onChange, children, submitTitle = 'Submit'}: Props) => {
    const {initialValues, validate, handleSubmit} = Service;
    return (
        <Formik initialValues={{...initialValues}} validate={validate} onSubmit={handleSubmit(onChange)}>
            {({errors, handleSubmit}) => (
                <Form>
                    <TextInput name="username" label="Username" autoFocus={true} required={true} />
                    <TextInput name="password" type="password" label="Password" required={true} />
                    <FormLevelErrMsg errors={errors.detail} />
                    <Row>
                        <Col span={12}>{children}</Col>
                        <Col span={12} className="right">
                            <Button type="primary" htmlType="submit" icon="check">
                                Đăng nhập
                            </Button>
                        </Col>
                    </Row>
                </Form>
            )}
        </Formik>
    );
};
