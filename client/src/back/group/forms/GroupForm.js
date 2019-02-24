// @flow
import * as React from 'react';
import PermissionsInput from './PermissionsInput';
import Tools from 'src/utils/helpers/Tools';
import type {FormValues} from '../_data';
import {defaultFormValues} from '../_data';
import type {FormValues as PermissionType} from 'src/back/permission/_data';

type Props = {
    formValues: FormValues,
    formErrors: Object,
    permissionList: {[string]: PermissionType},
    handleSubmit: Function,
    children?: React.Node
};
type States = {
    formValues: FormValues,
    actionName: string
};

export default class GroupForm extends React.Component<Props, States> {
    static defaultProps = {};
    name = 'group';

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
            <form id={this.name} onSubmit={handleSubmit}>
                <input defaultValue={formValues.id} name="id" id={`${this.name}-id`} type="hidden" />
                <div className="form-group name-field">
                    <label htmlFor="${name}-name">Name</label>
                    <input
                        defaultValue={formValues.name}
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

                <PermissionsInput name="permissions" options={this.props.permissionList} />

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
