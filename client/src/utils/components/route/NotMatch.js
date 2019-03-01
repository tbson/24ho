// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Link} from 'react-router-dom';

type Props = {};
class NotMatch extends React.Component<Props> {
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <div className="jumbotron">
                            <h1>Page not found</h1>
                            <Link to="/" className="btn btn-primary">
                                Back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default NotMatch;
