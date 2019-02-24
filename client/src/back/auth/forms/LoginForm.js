// @flow
import * as React from 'react';

type Props = {
    children?: React.Node,
    handleSubmit: Function,
    formId: string,
    submitTitle: string,
};

type States = {};

class LoginForm extends React.Component<Props, States> {
    resetForm: Function;

    static defaultProps = {
        submitTitle: 'Submit',
    };

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    resetForm = () => {
        window.document.getElementById(this.props.formId).reset();
        window.document.querySelector('#' + this.props.formId + ' [name=username]').focus();
    };

    render() {
        return (
            <form id={this.props.formId} onSubmit={this.props.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <div className="input-group">
                        <span className="input-group-prepend">
                            <span className="input-group-text">
                                <span className="fas fa-user" />
                            </span>
                        </span>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className="form-control"
                            required
                            placeholder="Username..."
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-group">
                        <span className="input-group-prepend">
                            <span className="input-group-text">
                                <span className="fas fa-lock" />
                            </span>
                        </span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-control"
                            required
                            placeholder="Password..."
                        />
                    </div>
                </div>

                <div className="right">
                    {this.props.children}
                    <button type="submit" className="btn btn-primary">
                        <span className="fas fa-check" />&nbsp;
                        {this.props.submitTitle}
                    </button>
                </div>
            </form>
        );
    }
}

export default LoginForm;
