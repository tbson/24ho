// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls} from './_data';
import NavWrapper from 'src/utils/components/NavWrapper';
import CustomerTable from './tables/CustomerTable';

type Props = {};
type States = {};

class Customer extends React.Component<Props, States> {
    state = {};

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        document.title = 'Customer manager';
    }

    render() {
        return (
            <NavWrapper>
                <CustomerTable />
            </NavWrapper>
        );
    }
}

const styles = {};

export default withRouter(Customer);
