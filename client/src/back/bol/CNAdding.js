// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Link} from 'react-router-dom';
// $FlowFixMe: do not complain about Yup
import {Button, Row, Col, Divider} from 'antd';
import ListTools from 'src/utils/helpers/ListTools';
import type {TRow} from './_data';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Preview from './cn_table/Preview';
import {FormPart, BagPart, Service as CNFormService} from './CNForm';

type Props = {};

export class Service {
    static prepareToEdit(uid: string): void {
        const event = new CustomEvent('PREPARE_TO_EDIT', {detail: uid});
        window.document.dispatchEvent(event);
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);

    const listAction = ListTools.actions(list);

    const onChange = (data: TRow) => {
        const type = list.find(item => item.id === data.id) ? 'update' : 'add';
        setList(listAction(data)[type]());
    };

    const onRemove = data => setList(listAction(data).remove());

    useEffect(() => {
        document.title = 'Bill of landing manager';
    }, []);

    return (
        <NavWrapper>
            <Row>
                <Col span={8}>
                    <div style={{padding: '15px'}}>
                        <BagPart />
                        <Divider />
                        <FormPart submitTitle="OK" onSubmit={CNFormService.handleSubmit(onChange)}>
                            <Row>
                                <Col span={12}>
                                    <Link to={`/bol/1`}>
                                        <Button icon="left">Quay lại</Button>
                                    </Link>
                                </Col>
                                <Col span={12} className="right">
                                    <Button type="primary" htmlType="submit" icon="check">
                                        Thêm
                                    </Button>
                                </Col>
                            </Row>
                        </FormPart>
                    </div>
                </Col>
                <Col span={16}>
                    <Preview list={list} onEdit={Service.prepareToEdit} onRemove={onRemove} />
                </Col>
            </Row>
        </NavWrapper>
    );
};
