// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Tabs} from 'antd';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';

const {TabPane} = Tabs;

export default () => {
    const [guideUrl, setGuideUrl] = useState('');
    useEffect(() => {
        document.title = 'Transaction manager';
        Tools.apiClient(apiUrls.getGuide).then(resp => setGuideUrl(resp.guide_transaction));
    }, []);

    return (
        <NavWrapper>
            <Tabs defaultIndex="0" type="card">
                <TabPane tab="Tài khoản" key="0">
                    <Table />
                </TabPane>
                <TabPane tab="Hướng dẫn" key="1">
                    <Preview src={guideUrl} />
                </TabPane>
            </Tabs>
        </NavWrapper>
    );
};

type Props = {
    src: string
};
const Preview = ({src}: Props) => {
    if (!src) return null;
    return (
        <iframe
            src={src}
            frameBorder={0}
            style={{overflow: 'hidden', height: '1000px', width: '100%'}}
            height="100%"
            width="1000px"
        />
    );
};
