import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './App.css';
import store, { setSocket } from './state';
import socketIOClient from "socket.io-client";
import Footer from './components/Footer';
import RenderContainer from './components/RenderContainer';
import { isMobile } from 'react-device-detect';

const socket = socketIOClient();

console.log("Connecting to socket");
socket.on('connect', () => {
  console.log("Socket connected!", socket.id);
  store.dispatch(setSocket(socket));
});

function App() {
  if (isMobile) {
    return (
      <div className='mobile-container'>
        <div className="mobileContainer">
          <p className="mobileMsg">This website is not suitable for mobile devices.
            <br />
            Please come back from your desktop.
            <br />
            <br />
            Thank you! </p>
        </div>
      </div>
    )
  }
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
