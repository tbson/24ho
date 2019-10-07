// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing node_modules
import {Tabs, Row, Col} from 'antd';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import DeliveryFeeTable from 'src/back/delivery_fee/main_table/';
import {apiUrls} from './_data';
import Tools from 'src/utils/helpers/Tools';

const {TabPane} = Tabs;

export class Service {
    static initialValues = {
        title: '',
        uid: ''
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
            <Tabs defaultIndex="0" type="card">
                <TabPane tab="Vùng" key="0">
                    <Row>
                        <Col span={8}>
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong>Vùng</strong>
                                        </td>
                                        <td>{data.title}</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Mã vùng</strong>
                                        </td>
                                        <td>{data.uid}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Đơn giá vận chuyển Kg" key="1">
                    <DeliveryFeeTable area={area} type={1} />
                </TabPane>
                <TabPane tab="Đơn giá vận chuyển khối" key="2">
                    <DeliveryFeeTable area={area} type={2} />
                </TabPane>
            </Tabs>
        </NavWrapper>
    );
};

export default withRouter(Detail);
