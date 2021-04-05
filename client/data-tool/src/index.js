
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import store, {setSocket} from './state'
import {Provider} from 'react-redux'
import App from './App';
import * as serviceWorker from './serviceWorker';

__webpack_public_path__ = 'http://localhost:8080/'


ReactDOM.render(
  <React.StrictMode>
	<Provider store={store}>
    <App />
	</Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
