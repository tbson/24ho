// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import DateRangeInput from 'src/utils/components/input/DateRangeInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
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
        {value: 'bol', label: 'Mã vận đơn'},
    ];
    const staffOptions = [
        {value: 'sale', label: 'Nhân viên mua hàng'},
        {value: 'cust_care', label: 'Nhân viên chăm sóc'},
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
                            </div>
                            <OnlyAdmin>
                                <div className="row">
                                    <div className="col">
                                        <SelectInput name="customer" options={options.customer} label="Khách hàng" />
                                    </div>
                                    <div className="col">
                                        <SelectInput name="sale" options={options.sale} label="Nhân viên mua hàng" />
                                    </div>
                                    <div className="col">
                                        <SelectInput
                                            name="cust_care"
                                            options={options.sale}
                                            label="Nhân viên chăm sóc"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <SelectInput
                                            options={booleanOptions}
                                            blankLabel="Chọn giá trị"
                                            name="shockproof"
                                            label="Chống sốc"
                                        />
                                    </div>
                                    <div className="col">
                                        <SelectInput
                                            options={booleanOptions}
                                            blankLabel="Chọn giá trị"
                                            name="wooden_box"
                                            label="Đóng gỗ"
                                        />
                                    </div>
                                    <div className="col">
                                        <SelectInput
                                            options={booleanOptions}
                                            blankLabel="Chọn giá trị"
                                            name="count_check"
                                            label="Kiểm đếm"
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <DateRangeInput name="created_at" label="Ngày tạo" />
                                    </div>
                                    <div className="col">
                                        <DateRangeInput name="approved_date" label="Ngày duyệt" />
                                    </div>
                                    <div className="col">
                                        <DateRangeInput name="checked_date" label="Ngày kiểm" />
                                    </div>
                                </div>
                            </OnlyAdmin>
                            <FormLevelErrMsg errors={errors.detail} />
                            <br/>
                            <ButtonsBar submitTitle="Search" onClick={handleSubmit} />
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};
