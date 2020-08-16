import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux';
import store from '../state';
import { useHistory } from "react-router-dom";
import Header from './Header';
import useSpinner from './useSpinner';

export default function Search() {
  const { register, errors, handleSubmit } = useForm({ mode: "onBlur" });
  const [datasetSession, setDatasetSession] = useState(true);
  const [loading, showLoading, hideLoading] = useSpinner();
  const socketSessionId = useSelector(state => state.socket ? state.socket.id : 0)
  let history = useHistory();

  async function onSubmit(formData) {
    await fetch('/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: formData.keyword, socket: socketSessionId })
    })
      .then(res => res.json())
      .then((data) => {
        console.log(data);
        setDatasetSession(data['dataset_session']);
        if (data.result === "OK") {
          fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: formData.keyword, session: data['dataset_session'], socket: socketSessionId })
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
      })
    console.log("Results are coming!")
    store.dispatch({
      type: 'SAVE_KEYWORD',
      keyword: formData.keyword
    })
    showLoading();
    setTimeout(() => {
      hideLoading()
      history.push("/edit")
    }, 3000);
  }

  return (
    <div className='firstScreen'>
      <Header />
      <div className='inputForm'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input className='word' name="keyword" autoComplete="off" placeholder="start typing..." ref={register({ required: true })} /> <br /><br />
          {errors.keyword && "It seems like you didn't type anything"}
          <button className="search" name="search" type="submit" ref={register}>Search</button>
          {loading}
        </form>
      </div>
    </div>
  )
}

