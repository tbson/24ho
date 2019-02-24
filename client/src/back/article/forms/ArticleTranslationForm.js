// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import RichTextInput from 'src/utils/components/RichTextInput';
import type {FormValues} from '../_data';
import {defaultFormValues} from '../_data';

type Props = {
    formValues: FormValues,
    formErrors: Object,
    handleSubmit: Function,
    parentUUID?: string,
    children?: React.Node
};
type States = {
    formValues: FormValues,
    actionName: string
};

export default class ArticleTranslationForm extends React.Component<Props, States> {
    static defaultProps = {};
    name = 'articleTranslation';

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
        window.document.querySelector(`form[name=${this.name}] [name=title]`).focus();
    };

    setClassName = (name: string) => {
        return this.props.formErrors[name] ? 'form-control is-invalid' : 'form-control';
    };

    setErrorMessage = (name: string) => {
        return this.props.formErrors[name];
    };

    renderPreview = () => {
        if (!this.state.formValues.image) return null;
        return (
            <div className="row">
                <div className="col col-lg-4">
                    <img src={this.state.formValues.image} width="100%" />
                </div>
            </div>
        );
    };

    render() {
        const {handleSubmit, children} = this.props;
        const {formValues, actionName} = this.state;
        return (
            <form name={this.name} onSubmit={handleSubmit}>
                <input defaultValue={formValues.id} name="id" id={`${this.name}-id`} type="hidden" />
                <div className="form-group title-field">
                    <label htmlFor="title">Title</label>
                    <input
                        defaultValue={this.state.formValues.title}
                        id="title"
                        name="title"
                        type="text"
                        className={this.setClassName('title')}
                        required
                        autoFocus
                        placeholder="Title..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('title')}</div>
                </div>

                <div className="form-group description-field">
                    <label htmlFor="description">Description</label>
                    <RichTextInput
                        parentUUID={this.props.parentUUID}
                        defaultValue={this.state.formValues.description}
                        name="description"
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('description')}</div>
                </div>

                <div className="form-group content-field">
                    <label htmlFor="content">Content</label>
                    <RichTextInput
                        parentUUID={this.props.parentUUID}
                        defaultValue={this.state.formValues.content}
                        name="content"
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('content')}</div>
                </div>

                <div className="right">
                    {children}
                    <button className="btn btn-primary main-action">
                        <span className="fas fa-check" />&nbsp;
                        <span className="label">{actionName}</span>
                    </button>
                </div>
            </form>
        );
    }
}
