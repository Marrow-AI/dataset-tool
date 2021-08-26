import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";
import store from '../state';
import Header from './Header';
import useSpinner from './useSpinner';

export default function Search(props) {
  const socketSessionId = useSelector(state => state.socket ? state.socket.id : 0)
  const numberPeople = useSelector(state => state.numberPeople);
  const { register, errors, handleSubmit } = useForm({ mode: "onBlur" });
  const [datasetSession, setDatasetSession] = useState(true);
  const [loading, showLoading, hideLoading] = useSpinner();
  const { showNext } = props;
  const [newKeyword, setNewKeyword] = useState()
  let history = useHistory();

  async function onSubmit(formData) {

    await fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: formData.keyword, socket: socketSessionId })
    })
      .then(res => res.json())
      .then((data) => {
        console.log(data);
        if (data.result === "OK") {
          store.dispatch({
            type: 'CLEAR_IMAGE_URLS'
          })
          setDatasetSession(data['dataset_session']);
          setNewKeyword(formData.keyword)
        } else {
          alert(data.result);
        }
        store.dispatch({
          type: 'SAVE_KEYWORD',
          keyword: formData.keyword
        })
      });
    showLoading();
    setTimeout(() => {
      hideLoading()
      history.push("/display")
    }, 4000);
  }

  return (
    <div className='firstScreen'>
      <div className="header">
        <h1 className="logo">This is a collaborative effort<br />
          to train a Machine Learning network<br />
          on human values and social rituals,<br />
          what kind of images would you like to contribute?</h1>
      </div>
      {loading}
      <div className='inputForm'>
        <form action="#data-scraping" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <input className='word' name="keyword" autoComplete="off" placeholder="start typing..." ref={register({ required: true })} /><br /><br />
            {errors.keyword && "It seems like you didn't type anything"}
          </div>
          <button className="search" name="search" type="submit" ref={register}>Search</button>
        </form>
      </div>
      { numberPeople == 2 ? 
        <p className='logo-people'>There is now <span className='logo-people number'>{numberPeople - 1}</span> person together with you.</p>
        :
        <p className='logo-people'>There are now <span className='logo-people number'>{numberPeople - 1}</span> people together with you.</p>
      }
    </div>
  )
}

