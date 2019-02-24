// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import type {FormValues} from '../_data';
import {defaultFormValues} from '../_data';

type Props = {
    handleSubmit: Function,
    children?: React.Node,
    uuid: string,
    formId: string,
    submitTitle: string,
    formValues: FormValues,
    formErrors: Object
};
type States = {
    formValues: FormValues,
    actionName: string
};

export default class AttachForm extends React.Component<Props, States> {
    resetForm: Function;
    setClassName: Function;
    setErrorMessage: Function;
    renderPreview: Function;

    static defaultProps = {
        submitTitle: 'Submit'
    };

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
        window.document.getElementById(this.props.formId).reset();
        window.document.querySelector('#' + this.props.formId + ' [name=title]').focus();
    };

    setClassName = (name: string) => {
        return this.props.formErrors[name] ? 'form-control is-invalid' : 'form-control';
    };

    setErrorMessage = (name: string) => {
        return this.props.formErrors[name];
    };

    renderPreview = () => {
        const {attachment, filetype, title} = this.state.formValues;
        if (!attachment) return null;
        if (filetype != 'image')
            return (
                <a href={attachment} target="_blank">
                    {title}
                </a>
            );
        return (
            <div className="row">
                <div className="col col-lg-4">
                    <img src={attachment} width="100%" />
                </div>
            </div>
        );
    };

    render() {
        const {handleSubmit, children} = this.props;
        const {formValues, actionName} = this.state;
        return (
            <form id={this.props.formId} onSubmit={this.props.handleSubmit}>
                <input defaultValue={this.state.formValues.id} name="id" type="hidden" />
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        defaultValue={this.state.formValues.title}
                        id="title"
                        name="title"
                        type="text"
                        className={this.setClassName('title')}
                        autoFocus
                        placeholder="Title..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('title')}</div>
                </div>

                <div className="form-group">
                    {this.renderPreview()}
                    <label htmlFor="attachment" style={{display: this.state.formValues.attachment ? 'none' : 'block'}}>
                        Attachment
                    </label>
                    <input
                        id="attachment"
                        name="attachment"
                        type="file"
                        className={this.setClassName('attachment')}
                        placeholder="Attachment..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('attachment')}</div>
                </div>

                <div className="form-group">
                    <label htmlFor="order">Order</label>
                    <input
                        defaultValue={this.state.formValues.order}
                        id="order"
                        name="order"
                        type="number"
                        className={this.setClassName('order')}
                        placeholder="Order..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('order')}</div>
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
