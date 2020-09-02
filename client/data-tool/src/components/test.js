import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:4000";
const socket = socketIOClient(ENDPOINT);

function App() {
  const [ loading, setLoading ] = useState(true);
  const [searchImages, setImages] = useState([]);
  const [value, setValue] = useState("");

  function fetchData() {
    console.log('click');
    socket.emit('fetch', value)
  }

  useEffect(() => {
    socket.on("getApiAndEmit", newImage => {
      setImages([
        ...searchImages,
        newImage
      ]);
    });
  });

  useEffect(() => () => socket.close(), [socket]);

  return (
    <div className='app-container'>
      <div className='input'>
      <input className='input-field center' onChange={e => setValue(e.target.value)} type="text" name={value.name} id={value.id} value={value.value} placeholder={value.placeholder} onChange={(e) => setValue(e.target.value)} maxLength="256"/>
        <button className='btn waves-effect waves-light amber darken-2' onClick={fetchData}> search </button>
      </div>

      {searchImages.map(item => (
        <div className='results' key={item.phone}>
          <div className='img-res'>
          <p>{item.name.first}</p>
          <img  src={item.picture.large} alt=""/>
          </div>
        </div>
      ))}
    </div>

  );
}

export default App;
