// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import NavWrapper from 'src/utils/components/NavWrapper';
import TagTable from './tables/TagTable';

type Props = {};
type States = {};

class Tag extends React.Component<Props, States> {
    state = {};

    constructor(props: Props) {
        super(props);
    }

    componentDidMount () {
        document.title = 'Tag manager';
    }

    render() {
        return (
            <NavWrapper>
                <TagTable />
            </NavWrapper>
        );
    }
}

const styles = {};

export default withRouter(Tag);
