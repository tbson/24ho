// @flow
import * as React from 'react';

type Props = Object;
type States = {
    name: string,
    value: string,
};

class TestInput extends React.Component<Props, States> {
    constructor(props: Props) {
        super(props);
        this.state = {
            name: props.name,
            value: props.value,
        };
    }

    render() {
        return (
            <div>
                <input type="hidden" name={this.state.name} value={this.state.value} />
                Hello
            </div>
        );
    }
}

const styles = {};
export default TestInput;
