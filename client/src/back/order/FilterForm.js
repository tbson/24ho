// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Row, Col, Button} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import DateRangeInput from 'src/utils/components/input/DateRangeInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import OnlyAdmin from 'src/utils/components/OnlyAdmin';

export class Service {
    static initialValues = {
        uid: '',
        purchase_code: '',
        bol: '',
        sale: '',
        cust_care: '',
        customer: '',
        shockproof: '',
        wooden_box: '',
        count_check: '',
        created_at: [null, null],
        updated_at: [null, null],
        approved_date: [null, null],
        checked_date: [null, null]
    };

    static validationSchema = Yup.object().shape({
        uid: Yup.string(),
        purchase_code: Yup.string(),
        bol: Yup.string(),
        sale: Yup.number(),
        cust_care: Yup.number(),
        customer: Yup.number(),
        shockproof: Yup.boolean(),
        wooden_box: Yup.boolean(),
        count_check: Yup.boolean(),
        created_at: Yup.array(Yup.object().nullable()),
        updated_at: Yup.array(Yup.object().nullable()),
        approved_date: Yup.array(Yup.object().nullable()),
        checked_date: Yup.array(Yup.object().nullable())
    });

    static booleanOptions = [{value: 1, label: 'Có'}, {value: 0, label: 'Không'}];

    static processFilterInput(filterInput: Object): Object {
        let values = {...filterInput};
        const created_at = Tools.rangeToCondition('created_at', values.created_at);
        const updated_at = Tools.rangeToCondition('updated_at', values.updated_at);
        const approved_date = Tools.rangeToCondition('approved_date', values.approved_date);
        const checked_date = Tools.rangeToCondition('checked_date', values.checked_date);
        values = Tools.mergeCondition(values, created_at);
        values = Tools.mergeCondition(values, updated_at);
        values = Tools.mergeCondition(values, approved_date);
        values = Tools.mergeCondition(values, checked_date);

        delete values.created_at;
        delete values.updated_at;
        delete values.approved_date;
        delete values.checked_date;

        values = Tools.removeEmptyKey(values);
        return values;
    }
}

type Props = {
    options: Object,
    onChange: Function
};
export default ({onChange, options = {sale: [], cust_care: [], customer: []}}: Props) => {
    const {initialValues, validationSchema, processFilterInput, booleanOptions} = Service;
    const codeOptions = [
        {value: 'uid', label: 'Mã đơn hàng'},
        {value: 'purchase_code', label: 'Mã giao dịch'},
        {value: 'bol', label: 'Mã vận đơn'}
    ];
    const staffOptions = [
        {value: 'sale', label: 'Nhân viên mua hàng'},
        {value: 'cust_care', label: 'Nhân viên chăm sóc'}
    ];
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
                                    <TextInput name="uid" label="Mã đơn hàng" />
                                </Col>
                                <Col span={8}>
                                    <TextInput name="purchase_code" label="Mã giao dịch" />
                                </Col>
                                <Col span={8}>
                                    <TextInput name="bol" label="Mã vận đơn" />
                                </Col>
                            </Row>
                            <OnlyAdmin>
                                <Row gutter={20}>
                                    <Col span={8}>
                                        <SelectInput name="customer" options={options.customer} label="Khách hàng" />
                                    </Col>
                                    <Col span={8}>
                                        <SelectInput name="sale" options={options.sale} label="Nhân viên mua hàng" />
                                    </Col>
                                    <Col span={8}>
                                        <SelectInput
                                            name="cust_care"
                                            options={options.sale}
                                            label="Nhân viên chăm sóc"
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col span={8}>
                                        <SelectInput
                                            options={booleanOptions}
                                            blankLabel="Chọn giá trị"
                                            name="shockproof"
                                            label="Chống sốc"
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <SelectInput
                                            options={booleanOptions}
                                            blankLabel="Chọn giá trị"
                                            name="wooden_box"
                                            label="Đóng gỗ"
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <SelectInput
                                            options={booleanOptions}
                                            blankLabel="Chọn giá trị"
                                            name="count_check"
                                            label="Kiểm đếm"
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col span={8}>
                                        <DateRangeInput name="created_at" label="Ngày tạo" />
                                    </Col>
                                    <Col span={8}>
                                        <DateRangeInput name="approved_date" label="Ngày duyệt" />
                                    </Col>
                                    <Col span={8}>
                                        <DateRangeInput name="checked_date" label="Ngày kiểm" />
                                    </Col>
                                </Row>
                            </OnlyAdmin>
                            <FormLevelErrMsg errors={errors.detail} />
                            <br />
                            <div className="right">
                                <Button type="primary" icon="search" htmlType="submit">Search</Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};
