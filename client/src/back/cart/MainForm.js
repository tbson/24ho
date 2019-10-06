// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Modal, Row, Col} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls, siteOptions} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import CartPhotoInput from 'src/utils/components/input/CartPhotoInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';

export class Service {
    static toggleEvent = 'TOGGLE_CART_MAIN_FORM';
    static toggleForm(open: boolean, item: Object) {
        Tools.event.dispatch(Service.toggleEvent, {open, item});
    }

    static initialValues = {
        title: '',
        url: '',
        shop_link: '',
        shop_nick: '',
        image: '',
        site: '',
        quantity: 0,
        unit_price: 0,
        color: '',
        size: '',
        note: ''
    };

    static validationSchema = Yup.object().shape({
        title: Yup.string().required(ErrMsgs.REQUIRED),
        url: Yup.string().required(ErrMsgs.REQUIRED),
        shop_link: Yup.string().required(ErrMsgs.REQUIRED),
        shop_nick: Yup.string().required(ErrMsgs.REQUIRED),
        site: Yup.string().required(ErrMsgs.REQUIRED),
        quantity: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .min(0, ErrMsgs.GT_0),
        unit_price: Yup.number()
            .required(ErrMsgs.REQUIRED)
            .min(0, ErrMsgs.GT_0),
        image: Yup.string(),
        color: Yup.string(),
        size: Yup.string(),
        note: Yup.string()
    });

    static handleSubmit(id: number, onChange: Function) {
        return (values: Object, {setErrors}: Object) => {
            const item = {id, ...values, checked: false};
            onChange(item, id ? 'update' : 'add');
        };
    }
}

type Props = {
    onChange: Function,
    submitTitle?: string
};
export default ({onChange, submitTitle = 'Lưu'}: Props) => {
    const formName = 'Mặt hàng hàng';
    const {validationSchema, handleSubmit} = Service;

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);

    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const retrieveThenOpen = (item: Object) => {
        setOpen(true);
        if (item) {
            setInitialValues({...item});
            setId(item.id);
        } else {
            setInitialValues({...Service.initialValues});
            setId(0);
        }
    };

    const handleToggle = ({detail: {open, item}}) => {
        open ? retrieveThenOpen(item) : setOpen(false);
    };

    useEffect(() => {
        Tools.event.listen(Service.toggleEvent, handleToggle);
        return () => {
            Tools.event.remove(Service.toggleEvent, handleToggle);
        };
    }, []);

    let handleOk = Tools.emptyFunction;

    return (
        <Modal
            destroyOnClose={true}
            visible={open}
            onOk={() => handleOk()}
            onCancel={() => Service.toggleForm(false)}
            okText={submitTitle}
            cancelText="Thoát"
            title={Tools.getFormTitle(id, formName)}>
            <Formik
                initialValues={{...initialValues}}
                validationSchema={validationSchema}
                onSubmit={handleSubmit(id, onChange)}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />

                            <Row gutter={20}>
                                <Col span={12}>
                                    <TextInput name="shop_link" label="Link shop" required />
                                </Col>
                                <Col span={12}>
                                    <TextInput name="shop_nick" label="Tên shop" required />
                                </Col>
                            </Row>

                            <SelectInput name="site" options={siteOptions} label="Trang gốc" required />

                            <Row gutter={20}>
                                <Col span={12}>
                                    <TextInput name="title" label="Tên sản phẩm" required />
                                </Col>
                                <Col span={12}>
                                    <TextInput name="url" label="Link sản phẩm" requred />
                                </Col>
                            </Row>

                            <CartPhotoInput name="image" label="Ảnh sản phẩm"/>

                            <Row gutter={20}>
                                <Col span={12}>
                                    <TextInput
                                        name="quantity"
                                        type="number"
                                        label="Số lượng"
                                        autoFocus={true}
                                        required
                                    />
                                </Col>
                                <Col span={12}>
                                    <TextInput name="unit_price" type="number" label="Đơn giá" required />
                                </Col>
                            </Row>

                            <Row gutter={20}>
                                <Col span={12}>
                                    <TextInput name="color" label="Màu" />
                                </Col>
                                <Col span={12}>
                                    <TextInput name="size" label="Size" />
                                </Col>
                            </Row>

                            <TextInput name="note" label="Ghi chú" />
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
