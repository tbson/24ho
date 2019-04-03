// @flow
import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls, defaultInputs} from './_data';
import type {FormState} from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import CheckInput from 'src/utils/components/input/CheckInput';
import SelectInput from 'src/utils/components/input/SelectInput';
import DefaultModal from 'src/utils/components/modal/DefaultModal';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

export class Service {
    static async changeRequest(params: Object) {
        return !params.id
            ? await Tools.apiCall(apiUrls.crud, params, 'POST')
            : await Tools.apiCall(apiUrls.crud + params.id, params, 'PUT');
    }

    static async retrieveRequest(id: number) {
        return await Tools.apiCall(apiUrls.crud + id);
    }

    static handleSubmit(id: number, close: Function, onSuccess: Function, onError: Function, setData: Function) {
        return (needToClose: boolean) => (e: Object) => {
            e.preventDefault();
            const params = Tools.formDataToObj(new FormData(e.target), ['is_lock']);
            return Service.changeRequest(id ? {...params, id} : params)
                .then(resp => {
                    if (!resp.ok) return Promise.reject(resp.data);
                    setData(defaultInputs);
                    needToClose && close();
                    onSuccess({...resp.data, checked: false}, id ? 'update' : 'add');
                })
                .catch(err => onError(Tools.setFormErrors(err)));
        };
    }

    static handleRetrieve(id: number, callback: Function) {
        return !id
            ? callback(defaultInputs)
            : Service.retrieveRequest(id)
                  .then(resp => (resp.ok ? callback(resp.data) : callback(defaultInputs)))
                  .catch(() => callback(defaultInputs));
    } 
}

type Props = {
    id: number,
    listSale: Array<Object>,
    listCustCare: Array<Object>,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node
};
export default ({id, listSale, listCustCare, open: _open, close, onChange, children}: Props) => {
    const [errors, setErrors] = useState({});
    const [data, setData] = useState(defaultInputs);
    const [open, setOpen] = useState(false);

    const handleSubmit = Service.handleSubmit(id, close, onChange, setErrors, setData);

    const afterRetrieve = (open: boolean) => (data: Object) => {
        setData(Tools.prepareUserData(data));
        setOpen(open);
    };

    const emptyForm = (): boolean => {
        setErrors({});
        setData(defaultInputs);
        return true;
    };

    useEffect(() => {
        emptyForm() && _open ? Service.handleRetrieve(id, afterRetrieve(_open)) : setOpen(_open);
    }, [_open]);

    return (
        <DefaultModal open={open} close={close} title="Customer manager">
            <Form
                listSale={listSale}
                listCustCare={listCustCare}
                onSubmit={handleSubmit}
                state={{data, errors}}
                children={children}
            />
        </DefaultModal>
    );
};

type FormProps = {
    listSale: Array<Object>,
    listCustCare: Array<Object>,
    onSubmit: Function,
    state: FormState,
    children?: React.Node,
    submitTitle?: string
};
export const Form = ({
    listSale,
    listCustCare,
    onSubmit: _onSubmit,
    children,
    state,
    submitTitle = 'Save'
}: FormProps) => {
    const [needToClose, setNeedToClose] = useState(true);
    const formElm = useRef(null);
    const firstInputSelector = "[name='email']";

    const resetAndFocus = form => {
        if (!form) return;
        const firstInput = form.querySelector(firstInputSelector);
        form.reset();
        firstInput && firstInput.focus();
    };

    const name = 'customer';
    const fieldId = Tools.getFieldId(name);
    const {id, user, email, username, first_name, last_name, phone, password, is_lock, sale_id, cust_care_id} = state.data;
    const {errors} = state;

    const errMsg = (name: string): Array<string> => state.errors[name] || [];

    const onSubmit = _onSubmit(needToClose);

    const onClick = e => setNeedToClose(!e.screenY && !e.screenY && !id ? false : true);

    useEffect(() => {
        Tools.isEmpty(errors) && resetAndFocus(formElm.current);
    }, [state]);

    return (
        <form name={name} ref={formElm} onSubmit={onSubmit}>
            <div className="row">
                <div className="col">
                    <TextInput
                        id={fieldId('email')}
                        type="email"
                        label="Email"
                        value={email}
                        errMsg={errMsg('email')}
                        required={true}
                        autoFocus={true}
                    />
                </div>
                <div className="col">
                    <TextInput
                        id={fieldId('username')}
                        label="Tên đăng nhập"
                        value={username}
                        required={true}
                        errMsg={errMsg('username')}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <TextInput
                        id={fieldId('last_name')}
                        label="Họ và tên lót"
                        value={last_name}
                        errMsg={errMsg('last_name')}
                        required={true}
                    />
                </div>

                <div className="col">
                    <TextInput
                        id={fieldId('first_name')}
                        label="Tên"
                        value={first_name}
                        errMsg={errMsg('first_name')}
                        required={true}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <TextInput
                        id={fieldId('phone')}
                        label="Phone"
                        value={phone}
                        errMsg={errMsg('phone')}
                        required={true}
                    />
                </div>
                <div className="col">
                    <TextInput
                        id={fieldId('password')}
                        type="password"
                        label="Password"
                        value={password}
                        errMsg={errMsg('password')}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <SelectInput
                        isMulti={false}
                        id={fieldId('sale_id')}
                        label="NV mua hàng"
                        options={listSale}
                        value={sale_id}
                    />
                </div>
                <div className="col">
                    <SelectInput
                        isMulti={false}
                        id={fieldId('cust_care_id')}
                        label="NV chăm sóc"
                        options={listCustCare}
                        value={cust_care_id}
                    />
                </div>
            </div>

            <CheckInput id={fieldId('is_lock')} label="Khoá" value={is_lock} errMsg={errMsg('is_lock')} />

            <ErrorMessages errors={errors.detail} />

            <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick} />
        </form>
    );
};
