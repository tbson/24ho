// @flow
import * as React from 'react';

type PropTypes = {
    errorMessage: string
};
class LoadingLabel extends React.Component<PropTypes> {
    static defaultProps = {
        errorMessage: ''
    };
    render() {
        const {errorMessage} = this.props;
        return (
            <div className={errorMessage ? "alert alert-danger" : "alert alert-info"} role="alert">
                {errorMessage || `Loading data...`}
            </div>
        );
    }
}

export default LoadingLabel;
