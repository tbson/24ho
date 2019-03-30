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
            const params = Tools.formDataToObj(new FormData(e.target), ['is_lock', 'is_sale', 'is_cust_care']);
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
    groups: Array<Object>,
    id: number,
    open: boolean,
    close: Function,
    onChange: Function,
    children?: React.Node
};
export default ({groups, id, open: _open, close, onChange, children}: Props) => {
    const [errors, setErrors] = useState({});
    const [data, setData] = useState(defaultInputs);
    const [open, setOpen] = useState(false);

    const handleSubmit = Service.handleSubmit(id, close, onChange, setErrors, setData);

    const afterRetrieve = (open: boolean) => (data: Object) => {
        setData(data);
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
        <DefaultModal open={open} close={close} title="Staff manager">
            <Form groupList={groups} onSubmit={handleSubmit} state={{data, errors}} children={children} />
        </DefaultModal>
    );
};

type FormProps = {
    groupList: Array<Object>,
    onSubmit: Function,
    state: FormState,
    children?: React.Node,
    submitTitle?: string
};
export const Form = ({groupList, onSubmit: _onSubmit, children, state, submitTitle = 'Save'}: FormProps) => {
    const [needToClose, setNeedToClose] = useState(true);
    const formElm = useRef(null);
    const firstInputSelector = "[name='email']";

    const resetAndFocus = form => {
        if (!form) return;
        const firstInput = form.querySelector(firstInputSelector);
        form.reset();
        firstInput && firstInput.focus();
    };

    const name = 'staff';
    const fieldId = Tools.getFieldId(name);
    const {id, email, username, first_name, last_name, password, groups, is_lock, is_sale, is_cust_care} = state.data;
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

            <TextInput id={fieldId('password')} type="password" label="Password" value={password} errMsg={errMsg('password')} />

            <SelectInput isMulti={true} id={fieldId('groups')} label="Quyền" options={groupList} value={groups} />

            <CheckInput id={fieldId('is_sale')} label="Nhân viên mua hàng" value={is_sale} errMsg={errMsg('is_lock')} />
            <CheckInput
                id={fieldId('is_cust_care')}
                label="Chăm sóc khách hàng"
                value={is_cust_care}
                errMsg={errMsg('is_cust_care')}
            />

            <CheckInput id={fieldId('is_lock')} label="Khoá" value={is_lock} errMsg={errMsg('is_lock')} />

            <ErrorMessages errors={errors.detail} />

            <ButtonsBar children={children} submitTitle={submitTitle} onClick={onClick} />
        </form>
    );
};
