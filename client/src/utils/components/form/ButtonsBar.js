// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about formik
import {Button, Row, Col} from 'antd';

type Props = {
    children?: React.Node,
    submitTitle: string,
    onClick?: Function
};
export default ({children, submitTitle, onClick}: Props) => {
    return (
        <Row>
            <Col span={12}>{children}</Col>
            <Col span={12} className="right">
                <button type="submit" style={{display: 'none'}} />
                <Button htmlType={onClick ? 'button' : 'submit'} type="primary" icon="check" onClick={onClick}>
                    {submitTitle}
                </Button>
            </Col>
        </Row>
    );
};
