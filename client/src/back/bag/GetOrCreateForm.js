// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
// $FlowFixMe: do not complain about Yup
import {Button, Modal} from 'antd';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import FormLevelErrMsg from 'src/utils/components/form/FormLevelErrMsg';
import Editable from 'src/utils/components/Editable';

export class Service {
    static toggleEvent = 'TOGGLE_BAG_GET_OR_CREATE_FORM';

    static firstInputSelector = "[name='uid']";

    static focusFirstInput() {
        const firstInput = document.querySelector(`form ${Service.firstInputSelector}`);
        firstInput && firstInput.focus();
    }

    static initialValues = {
        area: 0
    };

    static validationSchema = Yup.object().shape({
        area: Yup.number().required(ErrMsgs.REQUIRED)
    });

    static changeRequest(params: Object) {
        return !params.id
            ? Tools.apiCall(apiUrls.crud, params, 'POST')
            : Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static retrieveRequest() {
        return Tools.apiCall(apiUrls.crud);
    }

    static toggleForm(open: boolean) {
        Tools.event.dispatch(Service.toggleEvent, open);
    }
}

type Props = {
    onChange: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({onChange, children, submitTitle = 'Save'}: Props) => {
    const formName = 'Bao hàng';
    const {validationSchema} = Service;

    const [open, setOpen] = useState(false);
    const [initialValues, setInitialValues] = useState(Service.initialValues);

    const [listBag, setListBag] = useState([]);
    const [listArea, setListArea] = useState([]);

    const retrieveThenOpen = () =>
        Service.retrieveRequest().then(resp => {
            if (!resp.ok) return Tools.popMessage(resp.data.detail, 'error');
            // setInitialValues({...resp.data});
            const listBag = resp.data.items.map(item => ({value: item.id, label: item.uid}));
            const listArea = resp.data.extra.list_area.map(item => ({
                value: item.id,
                label: `${item.uid}-${item.title}`
            }));
            setListBag(listBag);
            setListArea(listArea);
            setOpen(true);
        });

    const handleAddBag = bag => {
        const newListBag = [{value: bag.id, label: bag.uid}, ...listBag];
        setListBag(newListBag);
    };

    const handleToggle = ({detail: open}) => {
        open ? retrieveThenOpen() : setOpen(false);
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
            title={formName}>
            <Formik initialValues={{...initialValues}} validationSchema={validationSchema} onSubmit={onChange}>
                {({errors, handleSubmit}) => {
                    if (handleOk === Tools.emptyFunction) handleOk = handleSubmit;
                    return (
                        <Form>
                            <button className="hide" />
                            <div style={{display: 'flex'}}>
                                <div style={{flexGrow: 1}}>
                                    <SelectInput name="bag" label="Chọn bao hàng" options={listBag} />
                                </div>
                                <div style={{alignSelf: 'flex-end', height: 47}}>
                                    <Editable
                                        onChange={handleAddBag}
                                        underline={false}
                                        adding={true}
                                        name="area"
                                        formater={parseInt}
                                        endPoint={apiUrls.crud}
                                        type="select"
                                        options={listArea}
                                        placeholder="Vùng...">
                                        <Button icon="plus" />
                                    </Editable>
                                </div>
                            </div>
                            <FormLevelErrMsg errors={errors.detail} />
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
};
