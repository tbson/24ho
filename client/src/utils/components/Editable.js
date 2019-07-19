// @flow
import * as React from 'react';
import {useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Popover from 'react-popover';
// $FlowFixMe: do not complain about importing node_modules
import {Formik, Form, Field, ErrorMessage} from 'formik';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Tools from 'src/utils/helpers/Tools';
// $FlowFixMe: do not complain about importing node_modules
import Loadable from 'react-loadable';
const Select = Loadable({
    // $FlowFixMe: do not complain about importing node_modules
    loader: () => import('react-select'),
    loading: () => <div>Loading select...</div>
});

type Props = {
    children: React.Node,
    onChange: Function,
    endPoint: string,
    options: SelectOptions,
    disabled: boolean,
    isMulti: boolean,
    name: string,
    value: string | number,
    type: string,
    formater: Function,
    adding: boolean,
    placeholder: string
};

type InputProps = {
    options: SelectOptions,
    isMulti: boolean,
    name: string,
    value: string | number,
    type: string,
    placeholder: string
};

const SelectInput = ({options, isMulti, name, value, type, placeholder}: InputProps) => {
    const [hiddenValue, setHiddenValue] = useState(value);
    const selectedValue = options.find(item => item.value === hiddenValue);
    return (
        <>
            <input name="value" defaultValue={hiddenValue} type="hidden" />
            <Select
                value={selectedValue}
                onChange={data => setHiddenValue(data.value)}
                isMulti={isMulti}
                isSearchable={true}
                placeholder={placeholder + '...'}
                options={options}
            />
        </>
    );
};

type State = {
    isOpen: boolean,
    hiddenValue: string | number
};
export default class TextInput extends React.Component<Props, State> {
    static defaultProps = {
        options: [],
        isMulti: false,
        adding: false,
        disabled: false,
        placeholder: 'Chọn',
        type: 'text',
        value: '',
        formater: (input: any) => input
    };
    state: State = {
        isOpen: false,
        hiddenValue: this.props.value
    };

    onSubmit(e: Object) {
        e.preventDefault();
        const {name, formater, endPoint, onChange, adding} = this.props;
        const params = Tools.formDataToObj(new FormData(e.target));
        params[name] = formater(params.value);
        Tools.apiCall(endPoint, params, adding ? 'POST' : 'PUT')
            .then(resp => {
                if (!resp.ok) return Promise.reject(resp.data);
                onChange(resp.data);
            })
            .catch(err => {
                Tools.popMessage(err, 'error');
            })
            .finally(() => {
                this.setState({isOpen: false});
                this.setState({hiddenValue: ''});
            });
    }

    input(
        name: string,
        value: string | number,
        type: string,
        placeholder: string,
        options: SelectOptions,
        isMulti: boolean
    ) {
        switch (type) {
            case 'select':
                return <SelectInput {...this.props} />;
            default:
                return (
                    <input
                        autoFocus={true}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        defaultValue={value}
                        className="form-control"
                    />
                );
        }
    }

    body() {
        const {name, value, type, placeholder, options, isMulti} = this.props;
        return (
            <form onSubmit={this.onSubmit.bind(this)}>
                <div className={'form-group'}>{this.input(name, value, type, placeholder, options, isMulti)}</div>
                <div className="center">
                    <button className="btn btn-success btn-sm">Save</button>
                </div>
            </form>
        );
    }

    render() {
        let {disabled, options, type} = this.props;
        if (type === 'select' && !options.length) disabled = true;
        const props = {
            isOpen: this.state.isOpen,
            onOuterAction: () => {
                this.setState({isOpen: false});
                this.setState({hiddenValue: ''});
            },
            body: this.body()
        };
        // $FlowFixMe: do not complain
        const children = React.cloneElement(this.props.children, {
            onClick: () => disabled || this.setState({isOpen: true}),
            // $FlowFixMe: do not complain
            className: (this.props.children.props.className || '') + (disabled ? '' : ' editable')
        });
        return <Popover {...props}>{children}</Popover>;
    }
}
