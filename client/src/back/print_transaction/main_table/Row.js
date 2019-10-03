// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing
import {Button} from 'antd';
import Tools from 'src/utils/helpers/Tools';
import {listType} from 'src/back/transaction/_data';
import type {TRow} from 'src/back/transaction/_data';

export class Service {}

type RowPropTypes = {
    data: TRow,
    onPrint: Function
};
export default ({data, onPrint}: RowPropTypes) => {
    const id = parseInt(data.id);

    return (
        <tr>
            <td className="mono">
                <span>{Tools.dateTimeFormat(data.created_at)}</span>
            </td>
            <td className="mono vnd">{Tools.numberFormat(parseInt(data.amount))}</td>
            <td>{data.staff_username}</td>
            {Tools.isAdmin() && <td>{data.customer_username}</td>}
            <td>{listType[String(data.type)]}</td>
            <td>{data.note}</td>
            <td className="center">
                <a className="editBtn" onClick={() => onPrint(data.id)}>
                    <Button size="small" icon="printer" />
                </a>
            </td>
        </tr>
    );
};
