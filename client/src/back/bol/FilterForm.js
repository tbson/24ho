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

export class Service {
    static initialValues = {
        uid: '',
        purchase_code: '',
        bol: '',
        sale: '',
        cust_care: '',
        customer: '',
        cn_date: [null, null],
        vn_date: [null, null],
        exported_date: [null, null]
    };

    static validationSchema = Yup.object().shape({
        uid: Yup.string(),
        purchase_code: Yup.string(),
        bol: Yup.string(),
        sale: Yup.number(),
        cust_care: Yup.number(),
        customer: Yup.number(),
        cn_date: Yup.array(Yup.object().nullable()),
        vn_date: Yup.array(Yup.object().nullable()),
        exported_date: Yup.array(Yup.object().nullable()),
    });

    static booleanOptions = [{value: 1, label: 'Có'}, {value: 0, label: 'Không'}];

    static processFilterInput(filterInput: Object): Object {
        let values = {...filterInput};
        const cn_date = Tools.rangeToCondition('cn_date', values.cn_date);
        const vn_date = Tools.rangeToCondition('vn_date', values.vn_date);
        const exported_date = Tools.rangeToCondition('exported_date', values.exported_date);
        values = Tools.mergeCondition(values, cn_date);
        values = Tools.mergeCondition(values, vn_date);
        values = Tools.mergeCondition(values, exported_date);

        delete values.cn_date;
        delete values.vn_date;
        delete values.exported_date;

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
                                    <TextInput name="order_uid" label="Mã đơn hàng" />
                                </Col>
                                <Col span={8}>
                                    <TextInput name="purchase_code" label="Mã giao dịch" />
                                </Col>
                                <Col span={8}>
                                    <TextInput name="uid" label="Mã vận đơn" />
                                </Col>
                            </Row>
                            <OnlyAdmin>
                                <Row gutter={20}>
                                    <Col span={8}>
                                        <SelectInput allowClear name="customer" options={options.customer} label="Khách hàng" />
                                    </Col>
                                    <Col span={8}>
                                        <SelectInput allowClear name="sale" options={options.sale} label="Nhân viên mua hàng" />
                                    </Col>
                                    <Col span={8}>
                                        <SelectInput
                                            allowClear
                                            name="cust_care"
                                            options={options.sale}
                                            label="Nhân viên chăm sóc"
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col span={8}>
                                        <DateRangeInput name="cn_date" label="Ngày về kho TQ" />
                                    </Col>
                                    <Col span={8}>
                                        <DateRangeInput name="vn_date" label="Ngày về kho VN" />
                                    </Col>
                                    <Col span={8}>
                                        <DateRangeInput name="exported_date" label="Ngày Xuất" />
                                    </Col>
                                </Row>
                            </OnlyAdmin>
                            <FormLevelErrMsg errors={errors.detail} />
                            <Divider />
                            <div className="right">
                                <Button type="primary" icon="search" htmlType="submit">Tìm</Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};
