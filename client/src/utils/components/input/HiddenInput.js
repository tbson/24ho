// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Field} from 'formik';

type Props = {
    name: string
};

export default ({name}: Props) => {
    return <Field id={name} name={name} type="hidden" />;
};
