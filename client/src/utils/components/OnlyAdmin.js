// @flow
import * as React from 'react';
import {APP} from 'src/constants';

type Props = {
    reverse?: boolean,
    children: React.Node
};

export default ({reverse = false, children}: Props) => {
    if (reverse) return APP !== 'admin' ? children : null;
    return APP === 'admin' ? children : null;
};
