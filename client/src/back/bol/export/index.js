// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
// $FlowFixMe: do not complain about importing
import {Button, Row, Col} from 'antd';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import PrepareTable from './prepare_table/';
import ResultTable from './result_table/';
import DelayInput from 'src/utils/components/DelayInput';
import ExportForm from './ExportForm';
import {Service as ExportFormService} from './ExportForm';

type Props = {
    match: Object,
    history: Object
};

const Component = ({match, history}: Props) => {
    const [list, setList] = useState([]);
    const [prepareList, setPrepareList] = useState([]);
    const [resultList, setResultList] = useState([]);

    useEffect(() => {
        document.title = 'Export bol';
        Tools.apiClient(apiUrls.readyToExport)
            .then(resp => {
                setList([...resp.items]);
                setPrepareList([...resp.items]);
            })
            .catch(_ => setPrepareList([]));
    }, []);

    const moveRight = id => {
        // $FlowFixMe: do not complain
        setPrepareList(prepareList.filter(item => item.id !== id));
        setResultList([...resultList, list.find(item => item.id === id)]);
    };
    const moveLeft = id => {
        // $FlowFixMe: do not complain
        setResultList(resultList.filter(item => item.id !== id));
        setPrepareList([...prepareList, list.find(item => item.id === id)]);
    };

    const moveUid = uid => {
        const item = list.find(item => item.uid === uid);
        item && moveRight(item.id);
    };

    const addressFilter = address_code => {
        const address = address_code.trim().toUpperCase();
        console.log(address);
        setPrepareList([...list.filter(item => item.address_code === address)]);
        setResultList([]);
    };

    const exportCheck = () => {
        // $FlowFixMe: do not complain
        const ids = resultList.map(item => item.id);
        Tools.apiClient(apiUrls.exportCheck, {ids: ids.join(',')}).then(resp => {
            resp.ok && ExportFormService.toggleForm(true);
        });
    };

    return (
        <NavWrapper>
            <Row>
                <Col span={6}>
                    <DelayInput clearAfterSet onChange={moveUid} placeholder="Mã vận đơn..." />
                </Col>
                <Col span={6}>
                    <DelayInput onChange={addressFilter} placeholder="Mã địa chỉ..." />
                </Col>
                <Col span={12}>
                    <Button
                        block
                        type="primary"
                        icon="shopping-cart"
                        onClick={exportCheck}
                        disabled={!resultList.length}>
                        Xuất Hàng
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <PrepareTable list={prepareList} move={moveRight} />
                </Col>
                <Col span={12}>
                    <ResultTable list={resultList} move={moveLeft} />
                </Col>
            </Row>

            <ExportForm onChange={() => Tools.navigateTo(history)('/receipt')} ids={resultList.map(item => item.id)} />
        </NavWrapper>
    );
};

export default withRouter(Component);
