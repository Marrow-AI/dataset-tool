import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './App.css';
import store, { setSocket } from './state';
import socketIOClient from "socket.io-client";
import Footer from './components/Footer';
import RenderContainer from './components/RenderContainer';

const ENDPOINT = "http://localhost:8540";
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
          <Route exact path="/" component={RenderContainer} />
        <Footer />
      </Router>
    </div>
    </>
  );
}

export default App;
