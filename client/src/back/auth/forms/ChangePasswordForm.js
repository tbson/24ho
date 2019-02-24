// @flow
import * as React from 'react';

type Props = {
    children?: React.Node,
    handleSubmit: Function,
    submitTitle: string,
    errorMessage: Object
};

type States = {};

class ChangePasswordForm extends React.Component<Props, States> {
    formId: string;

    static formId = 'changePassword';
    static defaultProps = {
        submitTitle: 'Submit',
        errorMessage: {}
    };

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    resetForm = () => {
        window.document.getElementById(this.formId).reset();
        window.document.querySelector('#' + this.formId + ' [name=oldPassword]').focus();
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
                    <label htmlFor="oldPassword">Old password</label>
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <span className="fas fa-lock" />
                            </span>
                        </div>
                        <input
                            id="oldPassword"
                            name="oldPassword"
                            type="password"
                            className={this.setClassName('oldPassword')}
                            required
                            autoFocus
                            placeholder="Old password..."
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <span className="fas fa-lock" />
                            </span>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className={this.setClassName('password')}
                            required
                            placeholder="New password..."
                        />
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

export default ChangePasswordForm;
