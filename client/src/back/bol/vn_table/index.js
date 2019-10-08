// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about Yup
import {Button} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import Row from './Row.js';

type Props = {};

export class Service {
    static listRequest(url?: string, params?: Object): Promise<Object> {
        return Tools.apiCall(url ? url : apiUrls.crud, params);
    }

    static handleGetList(url?: string, params?: Object = {}): Promise<Object> {
        return Service.listRequest(url, params)
            .then(resp => (resp.ok ? resp.data || {} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [links, setLinks] = useState({next: '', previous: ''});

    const listAction = ListTools.actions(list);

    const getList = async (url?: string, params?: Object) => {
        const data = await Service.handleGetList(url, {...params, vn_date__isnull: false});
        if (!data) return;
        setList(ListTools.prepare(data.items));
        setLinks(data.links);
    };

    const searchList = (keyword: string) => getList('', keyword ? {search: keyword} : {});

    useEffect(() => {
        getList();
    }, []);

    return (
        <div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Ngày</th>
                        <th scope="col">Mã vận đơn</th>
                        <th scope="col">Bao</th>
                        <th scope="col">Khớp</th>
                        <th scope="col" style={{padding: 8}} className="row80 right">
                            <Button block type="primary" size="small" icon="reload" onClick={() => getList()} />
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td colSpan="99">
                            <SearchInput onSearch={searchList} />
                        </td>
                    </tr>
                </tbody>

                <tbody>
                    {list.map((data, index) => (
                        <Row className="table-row" data={data} key={index} index={index} />
                    ))}
                </tbody>

                <tfoot className="thead-light">
                    <tr>
                        <th className="row25 right" colSpan="99">
                            <Pagination next={links.next} prev={links.previous} onNavigate={getList} />
                        </th>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};
