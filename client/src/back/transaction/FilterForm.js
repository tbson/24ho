// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Row, Col, Button, Divider} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import DateRangeInput from 'src/utils/components/input/DateRangeInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import OnlyAdmin from 'src/utils/components/OnlyAdmin';
import {listMoneyTypeSelect} from './_data';

const moneyTypeOptions = Object.entries(listMoneyTypeSelect).map(([value, label]) => ({
    value,
    label
}));

export class Service {
    static initialValues = {
        created_at: [null, null],
        uid: '',
        money_type: '',
        is_assets: '',
        staff: '',
        customer: ''
    };

    static validationSchema = Yup.object().shape({
        created_at: Yup.array(Yup.object().nullable()),
        uid: Yup.string(),
        money_type: Yup.number(),
        is_assets: Yup.number(),
        staff_id: Yup.number(),
        customer_id: Yup.number()
    });

    static booleanOptions = [{value: 1, label: 'Có'}, {value: 0, label: 'Nợ'}];

    static processFilterInput(filterInput: Object): Object {
        let values = {...filterInput};
        const created_at = Tools.rangeToCondition('created_at', values.created_at);
        values = Tools.mergeCondition(values, created_at);

        delete values.created_at;

        values = Tools.removeEmptyKey(values);
        return values;
    }
}

type Props = {
    options: Object,
    onChange: Function
};
export default ({onChange, options = {staff: [], customer: []}}: Props) => {
    const {initialValues, validationSchema, processFilterInput, booleanOptions} = Service;

    return (
        <div style={{padding: 15}}>
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={values => onChange(processFilterInput(values))}>
                {({values, errors, handleSubmit}) => {
                    return (
                        <Form>
                            <Row gutter={20}>
                                <Col span={8}>
                                    <TextInput name="uid" label="Mã giao dịch" />
                                </Col>
                                <Col span={8}>
                                    <SelectInput name="is_assets" options={booleanOptions} label="Ghi có / nợ" />
                                </Col>
                                <Col span={8}>
                                    <SelectInput name="money_type" options={moneyTypeOptions} label="Loại tiền" />
                                </Col>
                            </Row>
                            <OnlyAdmin>
                                <Row gutter={20}>
                                    <Col span={12}>
                                        <SelectInput name="customer" options={options.customer} label="Khách hàng" />
                                    </Col>
                                    <Col span={12}>
                                        <SelectInput name="sale" options={options.staff} label="Nhân viên" />
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col span={8}>
                                        <DateRangeInput name="created_at" label="Ngày tạo" />
                                    </Col>
                                </Row>
                            </OnlyAdmin>
                            <FormLevelErrMsg errors={errors.detail} />
                            <Divider />
                            <div className="right">
                                <Button type="primary" icon="search" htmlType="submit">
                                    Tìm
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};
