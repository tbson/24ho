// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import type {FormValues} from '../_data';
import {apiUrls} from '../_data';
import SelectInput from 'src/utils/components/form/SelectInput';
import TextInput from 'src/utils/components/form/TextInput';
import {CancelButton, SubmitButton} from 'src/utils/components/TableUtils';

type Props = {
    formValues: FormValues,
    handleSubmit: Function,
    handleClose: Function,
    groupList: Array<Object>
};
type States = {
    formErrors: Object
};

export default class AdministratorForm extends React.Component<Props, States> {
   name = 'administrator';
    id: Function;
    static defaultProps = {
        handleClose: () => {}
    };

    errorMessage = (name: string): string => this.state.formErrors[name] || '';

    state = {
        formErrors: {}
    };

    constructor(props: Props) {
        super(props);
        this.id = Tools.getFieldId.bind(undefined, this.name);
    } 

    async handleSubmit(event: Object) {
        event.preventDefault();

        const params = Tools.formDataToObj(new FormData(event.target));
        const isEdit = params.id ? true : false;
        let url = apiUrls.crud;
        if (isEdit) url += String(params.id);

        const {data, error} = await Tools.handleSubmit(url, params);
        const isSuccess = Tools.isEmpty(error);

        if (isSuccess) {
            this.props.handleSubmit(isEdit, data);
        } else {
            this.onSubmitFail(error);
        }
    }

    onSubmitFail = (formErrors: Object) => {
        this.setState({formErrors});
    };

    render() {
        const {formValues, handleClose} = this.props;
        const actionName = Tools.getActionName(formValues.id);
        return (
            <form name={this.name} onSubmit={this.handleSubmit.bind(this)}>
                <input defaultValue={formValues.id} name="id" id={this.id('id')} type="hidden" />

                <div className="row">
                    <div className="col">
                        <TextInput
                            id={this.id('email')}
                            type="email"
                            label="Email"
                            value={formValues.email}
                            required={true}
                            autoFocus={true}
                            errorMessage={this.errorMessage('email')}
                        />
                    </div>
                    <div className="col">
                        <TextInput
                            id={this.id('username')}
                            label="Username"
                            value={formValues.username}
                            required={true}
                            errorMessage={this.errorMessage('username')}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <TextInput
                            id={this.id('first_name')}
                            label="First name"
                            value={formValues.first_name}
                            required={true}
                            errorMessage={this.errorMessage('first_name')}
                        />
                    </div>
                    <div className="col">
                        <TextInput
                            id={this.id('last_name')}
                            label="Last name"
                            value={formValues.last_name}
                            required={true}
                            errorMessage={this.errorMessage('first_name')}
                        />
                    </div>
                </div>

                <TextInput
                    id={this.id('password')}
                    type="password"
                    label="Password"
                    value={formValues.password}
                    errorMessage={this.errorMessage('password')}
                />

                <SelectInput
                    isMulti={true}
                    id={this.id('groups')}
                    label="Groups"
                    options={this.props.groupList}
                    value={formValues.groups}
                />

                <div className="row">
                    <div className="col-sm">
                        <CancelButton onClick={handleClose} />
                    </div>
                    <div className="col-sm right">
                        <SubmitButton label={actionName} />
                    </div>
                </div>
            </form>
        );
    }
}
