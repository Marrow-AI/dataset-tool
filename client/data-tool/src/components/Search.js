import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux'
import store from '../state'
import { useHistory, withRouter } from "react-router-dom";
import Header from './Header.js'

const Search = (props) => {
  const { register, handleSubmit } = useForm({ mode: "onBlur" });
  const [btn, setBtn] = useState(true);
  const [datasetSession, setDatasetSession] = useState(true);

  const socket = useSelector(state => state.socket)
  const socketSessionId = useSelector(state => state.socket ? state.socket.id : 0)
  let history = useHistory();

  function handleSession(e) {
    e.preventDefault()
    console.log("Create session with socket id", socketSessionId);
    fetch('http://localhost:8080/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: 'cats', socket: socketSessionId })
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

  const onSubmit = (formData) => {
    console.log("Search");
  
    fetch('http://localhost:8080/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: 'cats', session: datasetSession, socket: socketSessionId })
    })
      .then(res => res.json())
      .then((data) => {
        console.log(data);
        if (data.result === "OK") {
        } else {
          alert(data.result);
        }
      })
      store.dispatch({
        type: 'SAVE_KEYWORD', 
        keyword: formData.keyword
      })
    history.push("/edit");
  }

  return (
    <>
    <Header />
    <div className='input'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input name="keyword" autoComplete="off" placeholder="type a word..." ref={register({ required: true })} />
        <button name="session" value={btn} className="create-session" onClick={handleSession} ref={register}>Create session</button>
        <button name="search" type="submit" value={btn} className="search" ref={register}> Search </button>
      </form>
    </div>
    </>
  )
}

export default withRouter (Search);
