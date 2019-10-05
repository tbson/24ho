// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
// $FlowFixMe: do not complain about importing node_modules
import {Tabs} from 'antd';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about Yup
import {Row, Col} from 'antd';
import {STATUS} from 'src/back/order/_data';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Info from './Info';
import Accounting from './Accounting';
import OrderItemTable from 'src/back/order_item_table';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from 'src/back/order/_data';
import BolTable from 'src/back/bol/main_table/';

const {TabPane} = Tabs;

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
            <Row>
                <Col span={16} className="no-padding-right">
                    <Info pending={data.pending} data={data} addresses={options.addresses} onPartialChange={setData} />
                    <Tabs defaultActiveKey="0">
                        <TabPane tab="Sản Phẩm" key="0">
                            <OrderItemTable
                                order_id={id}
                                rate={data.rate}
                                pending={data.pending}
                                notifyChange={retrieve}
                            />
                        </TabPane>
                        <TabPane tab="Vận Đơn" key="1">
                            <BolTable order_id={id || 0} notifyChange={retrieve} readonly={!Tools.isAdmin()} />
                        </TabPane>
                    </Tabs>
                </Col>
                <Col span={8} className="no-padding-left">
                    <Accounting pending={data.pending} data={data} onPartialChange={setData} />
                </Col>
            </Row>
        </NavWrapper>
    );
};

export default withRouter(Detail);
