// @flow
import * as React from 'react';
import NavWrapper from 'src/utils/components/NavWrapper';
import AdministratorTable from './tables/AdministratorTable';

type Props = {};

export default class Administrator extends React.Component<Props> {
    componentDidMount() {
        document.title = 'Administrator manager';
    }

    render() {
        return (
            <NavWrapper>
                <AdministratorTable />
            </NavWrapper>
        );
    }
}
