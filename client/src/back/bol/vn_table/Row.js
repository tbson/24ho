// @flow
import * as React from 'react';
import Tools from 'src/utils/helpers/Tools';
import {BoolOutput} from 'src/utils/components/TableUtils';
import type {TRow} from '../_data';

type RowPropTypes = {
    index: number,
    data: TRow,
};
export default ({data, index}: RowPropTypes) => {
    const id = parseInt(data.id);


    return (
        <tr>
            <td>{index + 1}</td>
            <td>{Tools.dateTimeFormat(data.created_at)}</td>
            <td>{data.uid}</td>
            <td>{data.bag_uid}</td>
            <td>
                <BoolOutput value={!!data.cn_date} />
            </td>
            <td className="center" />
        </tr>
    );
};
