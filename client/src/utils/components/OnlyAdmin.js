// @flow
import * as React from 'react';
import {APP} from 'src/constants';

type Props = {
    extraCondition?: boolean,
    reverse?: boolean,
    children: React.Node
};

export default ({extraCondition = true, reverse = false, children}: Props) => {
    if (reverse) return APP !== 'admin' && extraCondition ? children : null;
    return APP === 'admin' && extraCondition ? children : null;
};
