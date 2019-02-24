// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import SelectInput from 'src/utils/components/SelectInput';
import type {FormValues} from '../_data';
import {defaultFormValues} from '../_data';

type Props = {
    formValues: FormValues,
    formErrors: Object,
    handleSubmit: Function,
    children?: React.Node,
};
type States = {
    formValues: FormValues,
    actionName: string
};

export default class CustomerForm extends React.Component<Props, States> {
    static defaultProps = {};
    name = 'customer';

    state = {
        formValues: defaultFormValues,
        actionName: ''
    };

    constructor(props: Props) {
        super(props);
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: States) {
        const formValues = !Tools.isEmpty(nextProps.formValues) ? nextProps.formValues : defaultFormValues;
        return {
            formValues,
            actionName: formValues.id ? 'Update' : 'Add new'
        };
    }

    resetForm = () => {
        window.document.querySelector(`form[name=${this.name}]`).reset();
        window.document.querySelector(`form[name=${this.name}] [name=email]`).focus();
    };

    setClassName = (name: string) => {
        return this.props.formErrors[name] ? 'form-control is-invalid' : 'form-control';
    };

    setErrorMessage = (name: string) => {
        return this.props.formErrors[name];
    };

    render() {
        const {handleSubmit, children} = this.props;
        const {formValues, actionName} = this.state;
        return (
            <form name={this.name} onSubmit={handleSubmit}>
                <input defaultValue={formValues.id} name="id" id={`${this.name}-id`} type="hidden" />
                <div className="row">
                    <div className="col-sm">
                        <div className="form-group email-field">
                            <label htmlFor="${name}-email">Email</label>
                            <input
                                defaultValue={this.state.formValues.email}
                                id="email"
                                name="email"
                                type="email"
                                className={this.setClassName('email')}
                                required
                                autoFocus
                                placeholder="Email..."
                            />
                            <div className="invalid-feedback">{this.setErrorMessage('email')}</div>
                        </div>
                    </div>
                    <div className="col-sm">
                        <div className="form-group username-field">
                            <label htmlFor="${name}-username">Username</label>
                            <input
                                defaultValue={this.state.formValues.username}
                                id="username"
                                name="username"
                                type="text"
                                className={this.setClassName('username')}
                                required
                                placeholder="Username..."
                            />
                            <div className="invalid-feedback">{this.setErrorMessage('username')}</div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm">
                        <div className="form-group first_name-field">
                            <label htmlFor="${name}-first_name">First name</label>
                            <input
                                defaultValue={this.state.formValues.first_name}
                                id="first_name"
                                name="first_name"
                                type="text"
                                className={this.setClassName('first_name')}
                                required
                                placeholder="First name..."
                            />
                            <div className="invalid-feedback">{this.setErrorMessage('first_name')}</div>
                        </div>
                    </div>
                    <div className="col-sm">
                        <div className="form-group last_name-field">
                            <label htmlFor="${name}-last_name">Last name</label>
                            <input
                                defaultValue={this.state.formValues.last_name}
                                id="last_name"
                                name="last_name"
                                type="text"
                                className={this.setClassName('last_name')}
                                required
                                placeholder="Last name..."
                            />
                            <div className="invalid-feedback">{this.setErrorMessage('last_name')}</div>
                        </div>
                    </div>
                </div>

                <div className="form-group password-field">
                    <label htmlFor="${name}-password">Password</label>
                    <input
                        defaultValue={this.state.formValues.password}
                        id="password"
                        name="password"
                        type="password"
                        className={this.setClassName('password')}
                        placeholder="Password..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('password')}</div>
                </div>

                <div className="row">
                    <div className="col-sm">{children}</div>
                    <div className="col-sm right">
                        <button className="btn btn-success">
                            <span className="fas fa-check" />&nbsp;
                            <span className="label">{actionName}</span>
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}
