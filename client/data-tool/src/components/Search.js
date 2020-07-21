import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux'
import store from '../state'
import { useHistory } from "react-router-dom";
import Header from './Header.js'

export default function Search() {
  const { register, handleSubmit } = useForm({ mode: "onBlur" });
  const [datasetSession, setDatasetSession] = useState(true);
  const socketSessionId = useSelector(state => state.socket ? state.socket.id : 0)
  let history = useHistory();

  async function onSubmit(formData) {
    await fetch('http://localhost:8080/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: 'cats', socket: socketSessionId })
    })
      .then(res => res.json())
      .then((data) => {
        console.log(data);
        setDatasetSession(data['dataset_session']);
        if (data.result === "OK") {
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
        } else {
          alert(data.result);
        }
      })
    console.log("Results are coming!")
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
          <button name="search" type="submit" className="search" ref={register}> Search </button>
        </form>
      </div>
    </>
  )
}

