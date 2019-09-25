// @flow
import * as React from 'react';
import {useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';

type Props = {
    match: Object
};

const Component = ({match}: Props) => {
    useEffect(() => {
        document.title = 'Bill of landing manager';
    }, []);

    return (
        <NavWrapper>
            <Table readonly={true}/>
        </NavWrapper>
    );
};

export default withRouter(Component);
