// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls} from './_data';
import NavWrapper from 'src/utils/components/NavWrapper';
import BannerTable from './tables/BannerTable';

type Props = {};
type States = {};

class Banner extends React.Component<Props, States> {
    state = {};

    constructor(props: Props) {
        super(props);
    }

    componentDidMount () {
        document.title = 'Banner/Gallery manager';
    }

    render() {
        return (
            <NavWrapper>
                <BannerTable />
            </NavWrapper>
        );
    }
}

const styles = {};

export default withRouter(Banner);
