// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Tools from 'src/utils/helpers/Tools';

type Props = {
    data: Object,
    move: Function
};

export default ({data, move}: Props) => {
    useEffect(() => {}, []);
    return (
       <tr>
            <td>{Tools.dateTimeFormat(data.created_at)}</td>
            <td>{data.uid}</td>
            <td>{data.address_code}</td>
            <td className="mono right">{data.mass}</td>
            <td className="mono right">{data.packages}</td>
            <td>
                <span className="fas fa-arrow-right green pointer" onClick={_ => move(data.id)}/>
            </td>
        </tr> 
    );
};
