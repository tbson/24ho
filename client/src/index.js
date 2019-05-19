import 'formdata-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router} from 'react-router-dom';
import {APP, History} from 'src/constants';
import App from './App';

const Index = () => (
    <Router history={History}>
        <App />
    </Router>
);

ReactDOM.render(<Index />, document.getElementById('app'));
