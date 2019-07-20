// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Tools from 'src/utils/helpers/Tools';
import {apiUrls} from './_data';
import Row from './vn_table/Row';

type Props = {};

export class Service {}

let inputTimeout;
export default ({}: Props) => {
    const [listBol, setListBol] = useState([]);
    const [listBolMatched, setListBolMatched] = useState([]);
    const [bagUid, setBagUid] = useState('');
    const [bolUid, setBolUid] = useState('');

    const handleBagUidChange = e => {
        const value = e.target.value;
        setBagUid(value);

        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => handleSearch(value), 500);
    };

    const handleBolUidChange = e => {
        const value = e.target.value;
        setBolUid(value);

        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => handleMatch(value, bagUid), 500);
    };

    const handleSearch = (bag_uid: string) => {
        Tools.apiCall(apiUrls.crud, {bag_uid, vn_date__isnull: true}).then(resp => {
            setBolUid('');
            const bolInput = document.querySelector('#bol-input');
            if (resp.ok) {
                if (!resp.data.items.length)
                    return Tools.popMessage('Bao hàng không tồn tại hoặc đã kiểm hết.', 'error');
                bag_uid && bolInput && bolInput.focus();
                setListBol(resp.data.items);
            }
        });
    };

    const handleMatch = (bol_uid: string, bag_uid: string) => {
        Tools.apiCall(apiUrls.match_vn, {bag_uid, bol_uid}, 'POST').then(resp => {
            if (!resp.ok) return Tools.popMessage('Vận đơn không khớp.', 'error');
            setListBolMatched([...listBolMatched, resp.data]);
            setListBol([...listBol.filter(item => item.id !== resp.data.id)]);
        });
    };

    const TableHead = () => (
        <thead className="thead-light">
            <tr>
                <th scope="col">#</th>
                <th scope="col">Ngày</th>
                <th scope="col">Mã vận đơn</th>
                <th scope="col">Bao</th>
                <th scope="col">Khớp</th>
                <th scope="col" />
            </tr>
        </thead>
    );

    useEffect(() => {}, []);

    return (
        <div className="row">
            <div className="col">
                <div className="form-group">
                    <label htmlFor="bag-input">Bao hàng</label>
                    <input
                        className="form-control"
                        id="bag-input"
                        value={bagUid}
                        onChange={handleBagUidChange}
                        placeholder="Bao hàng"
                    />
                </div>
                <table className="table table-striped">
                    <TableHead />
                    <tbody>
                        {listBol.map((item, index) => (
                            <Row data={item} key={item.id} index={index}/>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="col">
                <div className="form-group">
                    <label htmlFor="bol-input">Vận đơn VN</label>
                    <input
                        className="form-control"
                        id="bol-input"
                        value={bolUid}
                        onChange={handleBolUidChange}
                        placeholder="Vận đơn VN"
                    />
                </div>
                <table className="table table-striped">
                    <TableHead />
                    <tbody>
                        {listBolMatched.map((item, index) => (
                            <Row data={item} key={item.id} index={index}/>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
