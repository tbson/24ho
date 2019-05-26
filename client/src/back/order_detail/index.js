// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
// $FlowFixMe: do not complain about importing node_modules
import 'react-tabs/style/react-tabs.css';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {STATUS} from 'src/back/order/_data';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Info from './Info';
import Accounting from './Accounting';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from 'src/back/order/_data';

export class Service {
    static retrieveRequest(id: number) {
        return Tools.apiCall(apiUrls.crud + id);
    }
}

type Props = {
    match: Object
};

const Detail = ({match}) => {
    const id = match.params.id;
    const [data, setData] = useState({
        statistics: {
            links: 0,
            packages: 0,
            quantity: 0
        }
    });
    useEffect(() => {
        document.title = 'Order detail';
        Service.retrieveRequest(id).then(resp => {
            resp.ok && setData(resp.data);
        });
    }, []);
    return (
        <NavWrapper>
            <div className="row">
                <div className="col-md-9">
                    <Info data={data} />
                    <Tabs>
                        <TabList>
                            <Tab>
                                <span>Sản Phẩm</span>
                            </Tab>
                            <Tab>
                                <span>Vận Đơn</span>
                            </Tab>
                        </TabList>
                        <TabPanel>Sản phẩm</TabPanel>
                        <TabPanel>Vận Đơn</TabPanel>
                    </Tabs>
                </div>
                <div className="col-md-3">
                    <Accounting data={data}/>
                </div>
            </div>
        </NavWrapper>
    );
};

export default withRouter(Detail);
