// @flow
import * as React from 'react';

type Props = {
    value?: boolean,
    children: React.Node
};

export default ({value = true, children}: Props) => {
    return value ? children : null;
};
