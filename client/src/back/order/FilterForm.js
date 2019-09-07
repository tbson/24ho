// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import TextInput from 'src/utils/components/input/TextInput';
import DateRangeInput from 'src/utils/components/input/DateRangeInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static initialValues = {
        uid: '',
        purchase_code: '',
        bol: '',
        created_at: [null, null]
    };

    static validationSchema = Yup.object().shape({
        uid: Yup.string(),
        purchase_code: Yup.string(),
        bol: Yup.string(),
        created_at: Yup.array(Yup.object().nullable())
    });
}

type Props = {
    onChange: Function
};
export default ({onChange}: Props) => {
    const {initialValues, validationSchema} = Service;
    return (
        <div style={{padding: 15}}>
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={values => onChange(values)}>
                {({values, errors, handleSubmit}) => {
                    return (
                        <Form>
                            <div className="row">
                                <div className="col">
                                    <TextInput name="uid" label="Mã đơn hàng" />
                                </div>
                                <div className="col">
                                    <TextInput name="purchase_code" label="Mã giao dịch" />
                                </div>
                                <div className="col">
                                    <TextInput name="bol" label="Mã vận đơn" />
                                </div>
                                <div className="col">
                                    <DateRangeInput name="created_at" label="Ngày tạo" />
                                </div>
                            </div>
                            <FormLevelErrMsg errors={errors.detail} />
                            <ButtonsBar submitTitle="Search" onClick={handleSubmit} />
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};
