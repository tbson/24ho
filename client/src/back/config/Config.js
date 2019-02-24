// @flow
import * as React from 'react';
import NavWrapper from 'src/utils/components/NavWrapper';
import ConfigTable from './tables/ConfigTable';

type Props = {};

export default class Config extends React.Component<Props> {
    componentDidMount() {
        document.title = 'Config manager';
    }

    render() {
        return (
            <NavWrapper>
                <ConfigTable />
            </NavWrapper>
        );
    }
}
