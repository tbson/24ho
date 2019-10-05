// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Link} from 'react-router-dom';
// $FlowFixMe: do not complain about formik
import {Row, Col} from 'antd';

type Props = {};
class NotMatch extends React.Component<Props> {
    render() {
        return (
            <div className="container">
                <Row>
                    <Col span={16} offset={4}>
                        <div className="jumbotron">
                            <h1>Page not found</h1>
                            <Link to="/" className="btn btn-primary">
                                Back
                            </Link>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default NotMatch;
