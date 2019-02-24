// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls} from './_data';
import NavWrapper from 'src/utils/components/NavWrapper';
import PermissionTable from './tables/PermissionTable';

type Props = {};
type States = {};

class Permission extends React.Component<Props, States> {
    state = {};

    constructor(props: Props) {
        super(props);
    }

    componentDidMount () {
        document.title = 'Permission manager';
    }

    render() {
        return (
            <NavWrapper>
                <PermissionTable />
            </NavWrapper>
        );
    }
}

const styles = {};

export default withRouter(Permission);
