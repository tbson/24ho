// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import type {FormValues} from '../_data';
import {defaultFormValues} from '../_data';

type Props = {
    formValues: FormValues,
    formErrors: Object,
    handleSubmit: Function,
    children?: React.Node
};
type States = {
    formValues: FormValues,
    actionName: string
};

export default class PermissionForm extends React.Component<Props, States> {
    static defaultProps = {};
    name = 'config';

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
        window.document.querySelector(`form[name=${this.name}] [name=name]`).focus();
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
                <p>
                    Content type: <strong>{this.state.formValues.content_type}</strong>
                </p>
                <div className="form-group name-field">
                    <label htmlFor="name">Name</label>
                    <input
                        defaultValue={this.state.formValues.name}
                        id="name"
                        name="name"
                        type="text"
                        className={this.setClassName('name')}
                        required
                        autoFocus
                        placeholder="Name..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('name')}</div>
                </div>

                <div className="form-group codename-field">
                    <label htmlFor="codename">Code name</label>
                    <input
                        defaultValue={this.state.formValues.codename}
                        id="codename"
                        name="codename"
                        type="text"
                        className={this.setClassName('codename')}
                        required
                        placeholder="Code name..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('codename')}</div>
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
