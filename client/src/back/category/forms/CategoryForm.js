// @flow
import * as React from 'react';
import SelectInput from 'src/utils/components/SelectInput';
import Tools from 'src/utils/helpers/Tools';
import type {FormValues, CatType} from '../_data';
import {defaultFormValues} from '../_data';

type Props = {
    formValues: FormValues,
    formErrors: Object,
    handleSubmit: Function,
    children?: React.Node,
    typeList: Array<CatType>
};
type States = {
    formValues: FormValues,
    actionName: string
};

export default class CategoryForm extends React.Component<Props, States> {
    static defaultProps = {
        typeList: []
    };
    name = 'category';

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

    render() {
        const {handleSubmit, children} = this.props;
        const {formValues, actionName} = this.state;
        return (
            <form name={this.name} onSubmit={handleSubmit}>
                <input defaultValue={formValues.id} name="id" id={`${this.name}-id`} type="hidden" />
                <div className="form-group title-field">
                    <label htmlFor="${name}-title">Title</label>
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

                <div className="form-group image_ratio-field">
                    <label htmlFor="${name}-image_ratio">Image ratio</label>
                    <input
                        defaultValue={this.state.formValues.image_ratio}
                        id="image_ratio"
                        name="image_ratio"
                        type="number"
                        step="0.001"
                        className={this.setClassName('image_ratio')}
                        placeholder="Image ratio (width / height). e.g: 1.618"
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('image_ratio')}</div>
                </div>

                <div className="form-group width_ratio-field">
                    <label htmlFor="${name}-width_ratio">Width ratio</label>
                    <div className="input-group">
                        <input
                            defaultValue={this.state.formValues.width_ratio}
                            id="width_ratio"
                            name="width_ratio"
                            type="number"
                            step="1"
                            min="1"
                            max="100"
                            className={this.setClassName('width_ratio')}
                            placeholder="1 to 100"
                        />
                        <div className="input-group-append">
                            <span className="input-group-text" id="basic-addon2">
                                %
                            </span>
                        </div>
                    </div>
                    <div className="invalid-feedback">{this.setErrorMessage('width_ratio')}</div>
                </div>

                <div className="form-group type-field">
                    <label htmlFor="${name}-type">Type</label>
                    <SelectInput
                        defaultValue={this.state.formValues.type}
                        name="type"
                        options={this.props.typeList || []}
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('type')}</div>
                </div>

                <div className="form-check single-field">
                    <input
                        id="single"
                        name="single"
                        type="checkbox"
                        defaultChecked={this.state.formValues.single}
                        className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="${name}-single">
                        Single
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
