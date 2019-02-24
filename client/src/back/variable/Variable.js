// @flow
import * as React from 'react';
import NavWrapper from 'src/utils/components/NavWrapper';
import VariableTable from './tables/VariableTable';

type Props = {};

export default class Variable extends React.Component<Props> {
    componentDidMount() {
        document.title = 'Variable manager';
    }

    render() {
        return (
            <NavWrapper>
                <VariableTable />
            </NavWrapper>
        );
    }
}
