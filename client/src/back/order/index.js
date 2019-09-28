// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Tabs} from 'antd';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import {STATUS} from './_data';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';

const {TabPane} = Tabs;

export class Service {
    static getStatusOptions(): SelectOptions {
        return Object.entries(STATUS)
            .filter(([value, label]) => value !== '0')
            .map(([value, label]) => ({value, label: String(label)}));
    }
}

export default () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        document.title = 'Order manager';
    }, []);
    const statusList = Object.entries(STATUS);
    return (
        <NavWrapper>
            <Tabs defaultActiveKey={`${statusList[0][0]}`} type="card" destroyInactiveTabPane={true}>
                {statusList.map(([key, value]) => (
                    <TabPane tab={value} key={`${key}`}>
                        <Table status={parseInt(key)} />
                    </TabPane>
                ))}

                <TabPane tab="Kiểm thiếu" key={`${statusList.length}`}>
                    <Table status={0} pending={true} />
                </TabPane>
            </Tabs>
        </NavWrapper>
    );
};
