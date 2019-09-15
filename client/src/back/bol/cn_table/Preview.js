// @flow
import * as React from 'react';
import type {ListItem} from '../_data';
import Row from './Row.js';

type Props = {
    list: ListItem,
    onEdit: Function,
    onRemove: Function
};


export default ({list, onEdit, onRemove}: Props) => {
    return (
        <div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th className="row25">#</th>
                        <th scope="col">Ngày</th>
                        <th scope="col">Mã vận đơn</th>
                        <th scope="col">Bao hàng</th>
                        <th scope="col">Địa chỉ</th>
                        <th scope="col" className="right">
                            Khối lượng
                        </th>
                        <th scope="col" className="right">
                            Dài / Rộng / Cao
                        </th>
                        <th scope="col" className="right">
                            Số kiện
                        </th>
                        <th scope="col">Ghi chú</th>
                        <th scope="col" style={{padding: 8}} className="row80" />
                    </tr>
                </thead>

                <tbody>
                    {list.map((data, key) => (
                        <Row
                            preview={true}
                            className="table-row"
                            item={data}
                            key={data.id}
                            total={list.length}
                            index={key}
                            onEdit={onEdit}
                            onRemove={onRemove}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
