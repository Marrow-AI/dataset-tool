import React from 'react';
import './App.css';
import Search from './components/Search.js'
import store, {setSocket} from './state'
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:8080";
const socket = socketIOClient(ENDPOINT);    

console.log("Connecting to socket");
socket.on('connect', () => {
	console.log("Socket connected!", socket.id);
	store.dispatch(setSocket(socket));
});


function App() {
  
  return (
    <div className='app-container'>
     <Search />
    </div>

  );
}

export default App;
