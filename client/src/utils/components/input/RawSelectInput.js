// @flow

import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Loadable from 'react-loadable';
import type {DropdownItemType} from 'src/utils/types/CommonTypes';

const Select = Loadable({
    // $FlowFixMe: do not complain about importing node_modules
    loader: () => import('react-select'),
    loading: () => <div>Loading select...</div>
});

type Props = {
    options: Array<DropdownItemType>,
    value: any,
    onChange: Function,
    isMulti: boolean
};

type States = {
    selected: any,
    value: ?string
};

const emptySelected = {
    value: '',
    label: ''
};

export default class RawSelectInput extends React.Component<Props, States> {
    state = {
        selected: null,
        value: ''
    };
    static defaultProps = {
        options: [],
        isMulti: false,
        value: ''
    };

    componentDidMount() {
        const {options, value, isMulti} = this.props;
        let selected, outputValue;
        if (!isMulti) {
            selected = options.find(option => option.value === value) || emptySelected;
            outputValue = selected.value;
        } else {
            selected = options.filter(option => (value || []).includes(option.value));
            outputValue = selected.map(selectObj => selectObj.value).join(',');
        }
        this.setState({selected, value: outputValue});
    }

    onChange = (selected: any) => {
        const {isMulti} = this.props;
        const value = !isMulti ? selected.value : selected.map(selectObj => selectObj.value).join(',');
        this.setState({selected, value});
        this.props.onChange(value);
    };

    render() {
        const {selected, value} = this.state;
        const {isMulti, options} = this.props;
        return (
            <Select options={options} value={selected} onChange={this.onChange} isMulti={isMulti} isSearchable={true} />
        );
    }
}
