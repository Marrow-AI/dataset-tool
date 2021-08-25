import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import './App.css';
import store, { setSocket } from './state';
import socketIOClient from "socket.io-client";
import Footer from './components/Footer';
import RenderContainer from './components/RenderContainer';
import { isMobile } from 'react-device-detect';
import DisplayImage from './components/DisplayImage.js';
import Search from './components/Search.js';
import EditImage from './components/EditImage.js';
import Results from './components/Results.js';

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
      <div className='mobile-container Main'>
        <div className="mobileContainer">
          <p className="mobileMsg">This website is not suitable for small size screens.
            <br />
            Please increase your window or revist from desktop.
            <br />
            <br />
            Thank you! </p>
        </div>
      </div>

      <div className='app-container'>
        <Router>
          <Search />
          <Route exact path="/display" component={DisplayImage} />
          <Route exact path="/edit" component={EditImage} />
          <Route exact path="/results/:numOfPeople/:numOfPermutations" component={Results} />
          <Footer />
        </Router>
      </div>
    </>
  );
}

export default App;
