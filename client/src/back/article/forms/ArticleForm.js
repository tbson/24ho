// @flow
import * as React from 'react';
import RichTextInput from 'src/utils/components/RichTextInput';
import SelectInput from 'src/utils/components/SelectInput';
import Tools from 'src/utils/helpers/Tools';
import type {FormValues} from '../_data';
import {defaultFormValues} from '../_data';
import type {DropdownItemType} from 'src/utils/types/CommonTypes';

type Props = {
    formValues: FormValues,
    formErrors: Object,
    handleSubmit: Function,
    children?: React.Node,
    parentUUID?: string,
    tagSource?: Array<DropdownItemType>
};
type States = {
    formValues: FormValues,
    actionName: string
};

export default class ArticleForm extends React.Component<Props, States> {
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

    componentDidUpdate(prevProps: Props, prevState: States) {
        this.resetForm();
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
        const {image, id} = this.state.formValues;
        if (!id || !image) return null;
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
                <input defaultValue={formValues.uuid} name="uuid" id={`${this.name}-uuid`} type="hidden" />
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

                <div className="form-group slug-field">
                    <label htmlFor="slug">Slug</label>
                    <input
                        defaultValue={this.state.formValues.slug}
                        id="slug"
                        name="slug"
                        type="text"
                        className={this.setClassName('slug')}
                        placeholder="Ex: this-is-slug"
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('slug')}</div>
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

                <div className="form-group image-field">
                    {this.renderPreview()}
                    <label htmlFor="image" style={{display: this.state.formValues.image ? 'none' : 'block'}}>
                        Image
                    </label>
                    <input
                        id="image"
                        name="image"
                        type="file"
                        className={this.setClassName('image')}
                        placeholder="Image..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('image')}</div>
                </div>

                <div className="form-group order-field">
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

                <div className="form-group tags-field">
                    <label htmlFor="groups">Tags</label>
                    <SelectInput
                        isMulti={true}
                        name="tags"
                        options={this.props.tagSource}
                        defaultValue={this.state.formValues.tags}
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('tags')}</div>
                </div>

                <div className="form-check use_slide-field">
                    <input
                        id="use_slide"
                        name="use_slide"
                        type="checkbox"
                        defaultChecked={this.state.formValues.use_slide}
                        className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="use_slide">
                        Use slide
                    </label>
                </div>

                <div className="form-check thumbnail_in_content-field">
                    <input
                        id="thumbnail_in_content"
                        name="thumbnail_in_content"
                        type="checkbox"
                        defaultChecked={this.state.formValues.thumbnail_in_content}
                        className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="thumbnail_in_content">
                        Thumbnail in content
                    </label>
                </div>

                <div className="form-check pin-field">
                    <input
                        id="pin"
                        name="pin"
                        type="checkbox"
                        defaultChecked={this.state.formValues.pin}
                        className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="pin">
                        Pin
                    </label>
                </div>

                <hr/>

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
