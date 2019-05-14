// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
// $FlowFixMe: do not complain about importing node_modules
import 'react-tabs/style/react-tabs.css';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import DeliveryFeeTable from 'src/back/delivery_fee/main_table/';
import {apiUrls} from './_data';
import Tools from 'src/utils/helpers/Tools';

export class Service {
    static initialValues = {
        title: '',
        uid: '',
    };

    static retrieveRequest(id: number) {
        return Tools.apiCall(apiUrls.crud + id);
    }
}

type Props = {
    match: Object
};

const Detail = ({match}: Props) => {
    const area = match.params.id;
    const [data, setData] = useState(Service.initialValues);
    useEffect(() => {
        document.title = 'Area detail';
        Service.retrieveRequest(area).then(resp => {
            console.log(resp);
            resp.ok && setData(resp.data);
        });
    }, []);

    return (
        <NavWrapper>
            <Tabs>
                <TabList>
                    <Tab>
                        <span className="fas fa-map-marker-alt icon-margin" />
                        <span>Vùng</span>
                    </Tab>
                    <Tab>
                        <span className="fas fa-balance-scale icon-margin" />
                        <span>Đơn giá vận chuyển Kg</span>
                    </Tab>
                    <Tab>
                        <span className="fas fa-balance-scale icon-margin" />
                        <span>Đơn giá vận chuyển khối</span>
                    </Tab>
                </TabList>

                <TabPanel>
                    <div className="row">
                        <div className="col-md-4">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td><strong>Vùng</strong></td>
                                        <td>{data.title}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Mã vùng</strong></td>
                                        <td>{data.uid}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel>
                    <DeliveryFeeTable area={area} type={1} />
                </TabPanel>
                <TabPanel>
                    <DeliveryFeeTable area={area} type={2} />
                </TabPanel>
            </Tabs>
        </NavWrapper>
    );
};

export default withRouter(Detail);
