// @flow
import * as React from 'react';
import {useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Tabs} from 'antd';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';
import CustomerGroupTable from 'src/back/customer_group/main_table/';

const {TabPane} = Tabs;

export default () => {
    useEffect(() => {
        document.title = 'Customer manager';
    }, []);

    return (
        <NavWrapper>
            <Tabs defaultActiveKey="0" type="card" destroyInactiveTabPane={true}>
                <TabPane tab="Khách hàng" key="0">
                    <Table />
                </TabPane>
                <TabPane tab="Nhóm" key="1">
                    <CustomerGroupTable />
                </TabPane>
            </Tabs>
        </NavWrapper>
    );
};
