// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
// $FlowFixMe: do not complain about formik
import {Formik, Form} from 'formik';
// $FlowFixMe: do not complain about Yup
import * as Yup from 'yup';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Tools from 'src/utils/helpers/Tools';
import ErrMsgs from 'src/utils/helpers/ErrMsgs';
import {apiUrls} from './_data';
import TextInput from 'src/utils/components/input/TextInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import SelectInput from 'src/utils/components/input/SelectInput';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
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
            handleOpen();
        });

    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);

    const handleAddBag = bag => {
        const newListBag = [{value: bag.id, label: bag.uid}, ...listBag];
        setListBag(newListBag);
    };

    const handleToggle = ({detail: open}) => {
        open ? retrieveThenOpen() : handleClose();
    };

    useEffect(() => {
        Tools.event.listen(Service.toggleEvent, handleToggle);
        return () => {
            Tools.event.remove(Service.toggleEvent, handleToggle);
        };
    }, []);

    return (
        <DefaultModal open={open} close={handleClose} title="Selec or create bag">
            <Formik initialValues={{...initialValues}} validationSchema={validationSchema} onSubmit={onChange}>
                {({errors, handleSubmit}) => (
                    <Form>
                        <div style={{display: 'flex'}}>
                            <div style={{flexGrow: 1}}>
                                <SelectInput name="bag" label="Bag" options={listBag} />
                            </div>
                            <div style={{alignSelf: 'flex-end'}}>
                                <Editable
                                    onChange={handleAddBag}
                                    adding={true}
                                    name="area"
                                    formater={parseInt}
                                    endPoint={apiUrls.crud}
                                    type="select"
                                    options={listArea}
                                    placeholder="Vùng...">
                                    <button type="button" className="btn btn-link btn-lg" style={{marginBottom: 13}}>
                                        <span className="fas fa-plus" />
                                    </button>
                                </Editable>
                            </div>
                        </div>
                        <FormLevelErrMsg errors={errors.detail} />
                        <ButtonsBar children={children} submitTitle={submitTitle} onClick={handleSubmit} />
                    </Form>
                )}
            </Formik>
        </DefaultModal>
    );
};
