// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {Switch, Route} from 'react-router-dom';

import {PUBLIC_URL} from 'src/constants';

import 'src/utils/styles/main-front.css';

import Spinner from 'src/utils/components/Spinner';

import Home from './home/Home';
import Tools from 'src/utils/helpers/Tools';
import Trans from 'src/utils/helpers/Trans';
import translations from 'src/utils/translations.json';

type Props = {};

class App extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        Trans.initTranslations(translations);
        window.document.addEventListener('CHANGE_LANG', ({detail}) => Trans.setLang(detail), false);
    }

    render() {
        return (
            <div>
                <Spinner />
                <Switch>
                    <Route exact path="/" component={Home} />
                </Switch>
            </div>
        );
    }
}

export default App;
