// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls} from './_data';
import NavWrapper from 'src/utils/components/NavWrapper';
import AttachTable from './tables/AttachTable';

type Props = {};
type States = {};

class Attach extends React.Component<Props, States> {
    state = {};

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <NavWrapper>
                <AttachTable />
            </NavWrapper>
        );
    }
}

const styles = {};

export default withRouter(Attach);
