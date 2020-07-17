import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux'
import store, {setSession} from '../state'

export default function Search() {

  const { register, fakeSubmit } = useForm({ mode: "onBlur" });
  const [searchImages, setImages] = useState([]);
  const [btn, setBtn] = useState(true);
  const [datasetSession, setDatasetSession] = useState(true);

  const socket = useSelector(state => state.socket)
  const socketSessionId = useSelector(state => state.socket ? state.socket.id : 0)
  const images = useSelector(state => state.images);
  function handleSession(e) {
    e.preventDefault()
    console.log("Create session with socket id", socketSessionId);
    fetch('http://localhost:8080/session', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({keyword: 'cats', socket: socketSessionId})
    })
    .then(res => res.json())
    .then((data) => {
        console.log(data);
		setDatasetSession(data['dataset_session']);
        if (data.result === "OK") {
        } else {
          alert(data.result);
        }
    })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    getImage(socket)
    console.log("Search");
    fetch('http://localhost:8080/search', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({keyword: 'cats', session:datasetSession, socket: socketSessionId})
    })
    .then(res => res.json())
    .then((data) => {
        console.log(data);
        if (data.result === "OK") {
        } else {
          alert(data.result);
        }
    })
  }

  const getImage = () => {
    if (socket) {
      socket.on('image', (data) => {
        console.log("New image!", data);

        // send the incoming message to the store
        store.dispatch({
          type: 'SOCKET_EVENT',
          eventName: 'image',
          data
        })
      });
    }
  }

  return(
    <>
    <div className='input'>
    <form onSubmit={fakeSubmit}>
      <input name="searchBar" autoComplete="off" placeholder="type a number..." ref={register({ required: true })} />
      <button name="session" value={btn} className="create-session" onClick={handleSession} ref={register}>Create session</button>
      <button name="search" value={btn} className="search" onClick={onSubmit} ref={register}> Search </button>
    </form>
    </div>

    <div>
      {images.map(data => (
        <div key={data.url}>
          <div>
          <img  src={data.url} alt=""/>
          </div>
        </div>
      ))}
    </div>
    </>
  )
}
