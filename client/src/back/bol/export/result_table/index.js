// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Tools from 'src/utils/helpers/Tools';
import Row from './Row';

type Props = {
    list: Array<Object>,
    move: Function
};

export default ({list, move}: Props) => {
    useEffect(() => {}, []);
    return (
        <div>
            <table className="table table-striped">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">Ngày</th>
                        <th scope="col">Mã vận đơn</th>
                        <th scope="col">Mã địa chỉ</th>
                        <th scope="col" className="right">
                            Khối lượng
                        </th>
                        <th scope="col" className="right">
                            Số kiện
                        </th>
                        <th scope="col" />
                    </tr>
                </thead>

                <tbody>
                    {list.map((data, key) => (<Row data={data} move={move} key={key}/>))}
                </tbody>
            </table>
        </div>
    );
};
