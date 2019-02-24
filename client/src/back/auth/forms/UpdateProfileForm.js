// @flow
import * as React from 'react';

type Props = {
    children?: React.Node,
    handleSubmit: Function,
    submitTitle: string,
    defaultValue: Object,
    errorMessage: Object
};
type States = {};

class UpdateProfileForm extends React.Component<Props, States> {
    formId: string;

    static formId = 'updateProfile';
    static defaultProps = {
        submitTitle: 'Submit',
        defaultValue: {
            username: null,
            email: null,
            first_name: null,
            last_name: null
        },
        errorMessage: {}
    };

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    resetForm = () => {
        window.document.getElementById(this.formId).reset();
        window.document.querySelector('#' + this.formId + ' [name=username]').focus();
    };

    setClassName = (name: string) => {
        return this.props.errorMessage[name] ? 'form-control is-invalid' : 'form-control';
    };

    setErrorMessage = (name: string) => {
        return this.props.errorMessage[name];
    };

    render() {
        return (
            <form id={this.formId} onSubmit={this.props.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        defaultValue={this.props.defaultValue.username}
                        id="username"
                        name="username"
                        type="text"
                        className={this.setClassName('username')}
                        required
                        autoFocus
                        placeholder="Username..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('username')}</div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        defaultValue={this.props.defaultValue.email}
                        id="email"
                        name="email"
                        type="email"
                        className={this.setClassName('email')}
                        required
                        placeholder="Email..."
                    />
                    <div className="invalid-feedback">{this.setErrorMessage('email')}</div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="first_name">Firstname</label>
                            <input
                                defaultValue={this.props.defaultValue.first_name}
                                id="first_name"
                                name="first_name"
                                type="text"
                                className={this.setClassName('first_name')}
                                required
                                placeholder="Firstname..."
                            />
                            <div className="invalid-feedback">{this.setErrorMessage('first_name')}</div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="last_name">Lastname</label>
                            <input
                                defaultValue={this.props.defaultValue.last_name}
                                id="last_name"
                                name="last_name"
                                type="text"
                                className={this.setClassName('last_name')}
                                required
                                placeholder="Lastname..."
                            />
                            <div className="invalid-feedback">{this.setErrorMessage('last_name')}</div>
                        </div>
                    </div>
                </div>

                <div className="right">
                    {this.props.children}
                    <button className="btn btn-primary">
                        <span className="fas fa-check" />&nbsp;
                        {this.props.submitTitle}
                    </button>
                </div>
            </form>
        );
    }
}

export default UpdateProfileForm;
