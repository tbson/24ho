// @flow
import * as React from 'react';
import NavWrapper from './NavWrapper';

type PropTypes = {
};
class NotMatch extends React.Component<PropTypes> {
    render() {
        return (
            <NavWrapper>
                <h1>Page not found</h1>
            </NavWrapper>
        );
    }
}

export default NotMatch;
