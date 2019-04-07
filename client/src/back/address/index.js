// @flow
import * as React from 'react';
import {useEffect} from 'react';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';

export default () => {
    useEffect(() => {
        document.title = 'Address manager';
    }, []);

    return (
        <NavWrapper>
            <Table />
        </NavWrapper>
    );
};
