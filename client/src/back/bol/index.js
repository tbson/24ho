// @flow
import * as React from 'react';
import {useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {Tabs} from 'antd';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';
import CNTable from './cn_table/';
import VNTable from './vn_table/';
import VNAdding from './VNAdding';
import DateTable from './date_table/';

const {TabPane} = Tabs;

type Props = {
    match: Object
};

const Component = ({match}: Props) => {
    useEffect(() => {
        document.title = 'Bill of landing manager';
    }, []);
    const type = match.params.type ? parseInt(match.params.type) : 0;
    const bag_id = match.params.bagId ? parseInt(match.params.bagId) : 0;
    return (
        <NavWrapper>
            <Tabs defaultIndex="0">
                <TabPane tab="Tất cả vận đơn" key="0">
                    <Table bag_id={bag_id} />
                </TabPane>
                <TabPane tab="Vận đơn theo ngày" key="1">
                    <DateTable />
                </TabPane>
                <TabPane tab="Vận đơn TQ" key="2">
                    <CNTable />
                </TabPane>
                <TabPane tab="Vận đơn VN" key="3">
                    <div className="row">
                        <div className="col">
                            <VNTable />
                        </div>
                        <div className="col">
                            <VNAdding />
                        </div>
                    </div>
                </TabPane>
            </Tabs>
        </NavWrapper>
    );
};

export default withRouter(Component);
