// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import styles from './Spinner.styl';
import Tools from 'src/utils/helpers/Tools';

type Props = {};
type State = {
    spinning: boolean
};

export default class Spinner extends React.Component<Props, State> {
    state = {
        spinning: false
    };
    constructor(props: Props) {
        super(props);
        Tools.emitter.addListener('TOGGLE_SPINNER', spinning => {
            this.setState({spinning});
        });
    }

    render() {
        if (!this.state.spinning) return null;
        return (
            <div className={styles.loaderBg}>
                <div className={styles.loader}>Loading...</div>
            </div>
        );
    }
}
