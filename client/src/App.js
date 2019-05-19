import 'formdata-polyfill';
import {hot} from 'react-hot-loader/root';
import React from 'react';
import Back from './back/App';
import Front from './front/App';

const App = () => (APP ? <Back /> : <Front />);
export default hot(App);
