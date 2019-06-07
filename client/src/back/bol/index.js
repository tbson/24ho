// @flow
import * as React from 'react';
import {useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
// $FlowFixMe: do not complain about importing node_modules
import 'react-tabs/style/react-tabs.css';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';
import CNTable from './cn_table/';
import VNTable from './vn_table/';

type Props = {
    match: Object
};

const Component = ({match}: Props) => {
    useEffect(() => {
        document.title = 'Bill of landing manager';
    }, []);

    // const type = match.params.type ? parseInt(match.params.type) : 0;
    const type = 2;
    return (
        <NavWrapper>
            <Tabs defaultIndex={type}>
                <TabList>
                    <Tab>
                        <span>Vận đơn</span>
                    </Tab>
                    <Tab>
                        <span>Vận đơn TQ</span>
                    </Tab>
                    <Tab>
                        <span>Vận đơn VN</span>
                    </Tab>
                </TabList>
                <TabPanel><Table type={0}/></TabPanel>
                <TabPanel><CNTable type={1}/></TabPanel>
                <TabPanel><VNTable type={2}/></TabPanel>
            </Tabs>
        </NavWrapper>
    );
};

export default withRouter(Component);
