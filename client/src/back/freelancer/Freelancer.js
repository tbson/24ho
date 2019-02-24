// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls} from './_data';
import NavWrapper from 'src/utils/components/NavWrapper';
import FreelancerTable from './tables/FreelancerTable';

type Props = {};
type States = {};

class Freelancer extends React.Component<Props, States> {
    state = {};

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        document.title = 'Freelancer manager';
    }

    render() {
        return (
            <NavWrapper>
                <FreelancerTable />
            </NavWrapper>
        );
    }
}

const styles = {};

export default withRouter(Freelancer);
