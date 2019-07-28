// @flow
import * as React from 'react';
import {useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
// $FlowFixMe: do not complain about importing node_modules
import 'react-tabs/style/react-tabs.css';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import {STATUS} from './_data';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';

export class Service {
    static getStatusOptions(): SelectOptions {
        return Object.entries(STATUS)
            .filter(([value, label]) => value !== '0')
            .map(([value, label]) => ({value, label: String(label)}));
    }
}

export default () => {
    useEffect(() => {
        document.title = 'Order manager';
    }, []);
    return (
        <NavWrapper>
            <Tabs>
                <TabList>
                    {Object.entries(STATUS).map(([key, value]) => (
                        <Tab key={key}>
                            {/* $FlowFixMe: shut up! fuck you nonsense error! */}
                            <span>{value}</span>
                        </Tab>
                    ))}
                    <Tab>
                        <span>Khiếu nại</span>
                    </Tab>
                </TabList>
                {Object.entries(STATUS).map(([key, value]) => (
                    <TabPanel key={key}>
                        <Table status={parseInt(key)} />
                    </TabPanel>
                ))}
                <TabPanel>
                    <Table status={0} pending={true} />
                </TabPanel>
            </Tabs>
        </NavWrapper>
    );
};
