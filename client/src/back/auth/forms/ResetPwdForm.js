// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';

type Props = {
    handleSubmit: Function,
    children?: React.Node,
    submitTitle?: string
};
export default ({handleSubmit, children, submitTitle = 'Reset password'}: Props) => {
    const name = 'reset-password';
    const id = Tools.getFieldId.bind(undefined, name);

    return (
        <form name={name} onSubmit={handleSubmit}>
            <TextInput id={id('email')} type="email" label="Email" required={true} autoFocus={true} />

            <TextInput id={id('password')} type="password" label="Password" required={true} />
            <TextInput id={id('password-again')} type="password" label="Password again" required={true} />

            <ButtonsBar children={children} submitTitle={submitTitle} />
        </form>
    );
};

type ButtonBarProps = {
    children?: React.Node,
    submitTitle: string
};
export const ButtonsBar = ({children, submitTitle}: ButtonBarProps) => {
    return (
        <div className="row">
            <div className="col">{children}</div>
            <div className="col right">
                <button type="submit" className="btn btn-primary">
                    <span className="fas fa-check" />
                    {submitTitle}
                </button>
            </div>
        </div>
    );
};
