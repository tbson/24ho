// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
import PrepareTable from './prepare_table/';
import ResultTable from './result_table/';
import DelayInput from 'src/utils/components/DelayInput';

type Props = {
    match: Object
};

const Component = ({match}: Props) => {
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
            console.log(resp);
        });
    };

    return (
        <NavWrapper>
            <div className="row">
                <div className="col-md-3">
                    <DelayInput clearAfterSet onChange={moveUid} placeholder="Mã vận đơn..." />
                </div>
                <div className="col-md-3">
                    <DelayInput onChange={addressFilter} placeholder="Mã địa chỉ..." />
                </div>
                <div className="col-md-6">
                    <button
                        type="button"
                        onClick={exportCheck}
                        className="btn btn-success btn-block"
                        disabled={!resultList.length}>
                        <span className="fas fa-dolly" />
                        &nbsp;
                        <span>Xuất Hàng</span>
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <PrepareTable list={prepareList} move={moveRight} />
                </div>
                <div className="col">
                    <ResultTable list={resultList} move={moveLeft} />
                </div>
            </div>
        </NavWrapper>
    );
};

export default withRouter(Component);
