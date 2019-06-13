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
import OrderItemTable from 'src/back/order_item_table';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from 'src/back/order/_data';
import BolTable from 'src/back/bol/main_table/';

export class Service {
    static retrieveRequest(id: number) {
        return Tools.apiCall(apiUrls.crud + id);
    }

    static prepareOptions(options: Object): Object {
        for (const key in options) {
            options[key] = options[key].map(item => ({
                value: item.id,
                label: [item.uid, item.title].join(' - ')
            }));
        }
        return options;
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

    const [options, setOptions] = useState({});

    const retrieve = () => {
        Service.retrieveRequest(id).then(resp => {
            if (resp.ok) {
                setData(resp.data);
                setOptions(Service.prepareOptions(resp.data.options));
            }
        });
    };

    useEffect(() => {
        document.title = 'Order detail';
        retrieve();
    }, []);

    return !data.rate ? null : (
        <NavWrapper>
            <div className="row">
                <div className="col-md-9 no-padding-right">
                    <Info data={data} addresses={options.addresses} onPartialChange={setData} />
                    <Tabs>
                        <TabList>
                            <Tab>
                                <span>Sản Phẩm</span>
                            </Tab>
                            <Tab>
                                <span>Vận Đơn</span>
                            </Tab>
                        </TabList>
                        <TabPanel>
                            <OrderItemTable order_id={id} rate={data.rate} notifyChange={retrieve} />
                        </TabPanel>
                        <TabPanel>
                            <BolTable order_id={id || 0} notifyChange={retrieve}/>
                        </TabPanel>
                    </Tabs>
                </div>
                <div className="col-md-3 no-padding-left">
                    <Accounting data={data} onPartialChange={setData} />
                </div>
            </div>
        </NavWrapper>
    );
};

export default withRouter(Detail);
