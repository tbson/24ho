// @flow
import * as React from 'react';
import {useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import NavWrapper from 'src/utils/components/nav_wrapper/';

type Props = {
    match: Object
};

const Component = ({match}: Props) => {
    useEffect(() => {
        document.title = 'Export bol';
    }, []);
    return (
        <NavWrapper>
            <div>Export</div>
        </NavWrapper>
    );
};

export default withRouter(Component);
