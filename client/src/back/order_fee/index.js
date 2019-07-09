// @flow
import * as React from 'react';
import {useEffect} from 'react';
import NavWrapperMaterial from 'src/utils/components/NavWrapperMaterial';
import Table from './main_table/';

export default () => {
    useEffect(() => {
        document.title = 'OrderFee manager';
    }, []);

    return (
        <NavWrapperMaterial>
            <Table />
        </NavWrapperMaterial>
    );
};
