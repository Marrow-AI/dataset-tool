import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './App.css';
import Search from './components/Search.js'
import store, { setSocket } from './state'
import socketIOClient from "socket.io-client";
import EditImage from './components/EditImage';

const ENDPOINT = "http://localhost:8080";
const socket = socketIOClient(ENDPOINT);

console.log("Connecting to socket");
socket.on('connect', () => {
  console.log("Socket connected!", socket.id);
  store.dispatch(setSocket(socket));
});


function App() {
  return (
    <>
    <div className='app-container'>
      <Router>
        <div>
          <Route exact path="/" component={Search} />
          <Route exact path="/edit" component={EditImage} />
        </div>
      </Router>
    </div>
    </>
  );
}

export default App;
