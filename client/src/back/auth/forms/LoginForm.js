// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import TextInput from 'src/utils/components/input/TextInput';
import type {FormState} from 'src/utils/helpers/Tools';
import ButtonsBar from 'src/utils/components/form/ButtonsBar';
import ErrorMessages from 'src/utils/components/form/ErrorMessages';

type Props = {
    handleSubmit: Function,
    children?: React.Node,
    submitTitle: string,
    state: FormState
};
export default ({handleSubmit, children, state, submitTitle = 'Submit'}: Props) => {
    const name = 'login';
    const id = Tools.getFieldId.bind(undefined, name);

    const errorMessages = (name: string): Array<string> => state.errors[name] || [];

    return (
        <form name={name} onSubmit={handleSubmit}>
            <TextInput
                id={id('username')}
                errorMessages={errorMessages('username')}
                label="Username"
                required={true}
                autoFocus={true}
            />

            <TextInput
                id={id('password')}
                errorMessages={errorMessages('password')}
                type="password"
                label="Password"
                required={true}
            />

            <ErrorMessages errors={state.errors.common} />

            <ButtonsBar children={children} submitTitle={submitTitle} />
        </form>
    );
};
