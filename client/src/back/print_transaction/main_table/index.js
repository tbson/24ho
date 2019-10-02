// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import type {SelectOptions} from 'src/utils/helpers/Tools';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls, listType, listMoneyType} from 'src/back/transaction/_data';
import type {TRow, DbRow, ListItem, FormOpenType, FormOpenKeyType} from 'src/back/transaction/_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import Row from './Row.js';
import Preview from '../Preview';
import {Service as PreviewService} from '../Preview';

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

    const getList = async (url?: string, _params?: Object) => {
        let params = {..._params, money_type: 1};
        const data = await Service.handleGetList(url, params);
        if (!data) return;
        setList(ListTools.prepare(data.items));
        setLinks(data.links);
    };

    const searchList = (keyword: string) => getList('', keyword ? {search: keyword} : {});

    const handlePrint = (id: number) => {
        PreviewService.toggleForm(true, id);
    };

    useEffect(() => {
        getList();
    }, []);

    return (
        <div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">Ngày</th>
                        <th scope="col" className="right">
                            Số lượng
                        </th>
                        <th scope="col">Nhân viên giao dịch</th>
                        <th scope="col">Khách hàng</th>
                        <th scope="col">Loại giao dịch</th>
                        <th scope="col">Ghi chú</th>
                        <th scope="col" style={{padding: 8}} className="row80" />
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td colSpan="99" style={{padding: 15, paddingBottom: 0}}>
                            <SearchInput onSearch={searchList} />
                        </td>
                    </tr>
                </tbody>

                <tbody>
                    {list.map((data, key) => (
                        <Row className="table-row" data={data} key={key} onPrint={handlePrint} />
                    ))}
                </tbody>

                {Tools.isAdmin() && (
                    <tfoot className="thead-light">
                        <tr>
                            <th className="row25 right" colSpan="99">
                                <Pagination next={links.next} prev={links.previous} onNavigate={getList} />
                            </th>
                        </tr>
                    </tfoot>
                )}
            </table>
            <Preview/>
        </div>
    );
};
