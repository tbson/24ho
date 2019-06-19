// @flow
import * as React from 'react';
import {APP} from 'src/constants';

type Props = {
    children: React.Node
};

export default ({children}: Props) => {
    return APP === 'admin' ? children : null;
};
