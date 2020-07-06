import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:8080";
let socket = socketIOClient(ENDPOINT);    

export default function Search() {
  const { register, fakeSubmit } = useForm({ mode: "onBlur" });
  // const [value, setValue] = useState("");
  const [searchImages, setImages] = useState([]);
  const [btn, setBtn] = useState(true);
  const [socketSessionId, setSocketSessionId] = useState('')

 
  function handleSession(e) {
    e.preventDefault()
    console.log("Create session");
    fetch('http://localhost:8080/session', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({keyword: 'cats', socket: socketSessionId})
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

  const onSubmit = (e) => {
    e.preventDefault()
    getImage(socketSessionId)
    console.log("Search");
    fetch('http://localhost:8080/search', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({keyword: 'cats'})
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
    console.log("id:", socketSessionId)
    if(socketSessionId !== "") {
    socket.on('image', (data) => {
      console.log("New image!", data);                      
      setImages([
        ...searchImages,
        data
        ]);
      });
  } 
}

  useEffect(() => {
    console.log("Connecting");
    setSocketSessionId(socket.id);
      socket.on('connect', () => {
        setSocketSessionId(socket.id);
        console.log("Socket connected!", socketSessionId);
        setBtn(false)
    })
  }, [socketSessionId])


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
      {searchImages.map(data => (
        <div className='results' key={data.session_id}>
          <div className='images'>
          <img  src={data.url} alt=""/>
          </div>
        </div>
      ))}
    </div>
    </>
  )
}