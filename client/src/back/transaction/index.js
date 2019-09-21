// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
// $FlowFixMe: do not complain about importing node_modules
import 'react-tabs/style/react-tabs.css';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';

export default () => {
    const [guideUrl, setGuideUrl] = useState('');
    useEffect(() => {
        document.title = 'Transaction manager';
        Tools.apiClient(apiUrls.getGuide).then(resp => setGuideUrl(resp.guide_transaction));
    }, []);

    return (
        <NavWrapper>
            <Tabs>
                <TabList>
                    <Tab>
                        <span>Tài khoản</span>
                    </Tab>
                    <Tab>
                        <span>Hướng dẫn</span>
                    </Tab>
                </TabList>
                <TabPanel>
                    <Table />
                </TabPanel>
                <TabPanel>
                    <Preview src={guideUrl}/>
                </TabPanel>
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
