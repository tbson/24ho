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

type State = {
    isOpen: boolean,
    hiddenValue: string | number
};
export default class TextInput extends React.Component<Props, State> {
    static defaultProps = {
        options: [],
        isMulti: false,
        disabled: false,
        placeholder: 'Chọn',
        type: 'text',
        value: ''
    };
    state: State = {
        isOpen: false,
        hiddenValue: this.props.value
    };

    onSubmit(e: Object) {
        e.preventDefault();
        const {name, endPoint, onChange} = this.props;
        const params = Tools.formDataToObj(new FormData(e.target));
        Tools.apiCall(endPoint, params, 'PUT')
            .then(resp => {
                onChange(resp.data);
            })
            .catch(err => {
                // Popup error here
                console.log(err);
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
                let _value = options.find(item => item.value === value);
                return (
                    <>
                        <input name="value" defaultValue={this.state.hiddenValue} type="hidden" />
                        <Select
                            value={_value}
                            onChange={data => this.setState({hiddenValue: data.value})}
                            isMulti={isMulti}
                            isSearchable={true}
                            placeholder={placeholder + '...'}
                            options={options}
                        />
                    </>
                );
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
        const {disabled} = this.props;
        const options = {
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
        return <Popover {...options}>{children}</Popover>;
    }
}
