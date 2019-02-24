// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls} from './_data';
import NavWrapper from 'src/utils/components/NavWrapper';
import EmployerTable from './tables/EmployerTable';

type Props = {};
type States = {};

class Employer extends React.Component<Props, States> {
    state = {};

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        document.title = 'Employer manager';
    }

    render() {
        return (
            <NavWrapper>
                <EmployerTable />
            </NavWrapper>
        );
    }
}

const styles = {};

export default withRouter(Employer);
