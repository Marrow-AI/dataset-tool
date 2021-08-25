import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toast';
import store from '../state';
import Header from './Header';
import useSpinner from './useSpinner';

export default function Search(props) {
  const socketSessionId = useSelector(state => state.socket ? state.socket.id : 0)
  const { register, errors, handleSubmit } = useForm({ mode: "onBlur" });
  const [datasetSession, setDatasetSession] = useState(true);
  const [loading, showLoading, hideLoading] = useSpinner();
  const { showNext } = props;
  const [newKeyword, setNewKeyword] = useState()

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
          setDatasetSession(data['dataset_session']);
          setNewKeyword(data.dataset_session.split('-')[0])
        } else {
          alert(data.result);
        }
        store.dispatch({
          type: 'SAVE_KEYWORD',
          keyword: data.dataset_session.split('-')[0]
        })
      });
    showLoading();
    setTimeout(() => {
      hideLoading()
      showNext()
    }, 4000);
  }

  const notification = () => {
    if (newKeyword !== undefined) {
      toast(`${newKeyword} was just added to your search`, {
        backgroundColor: '#8329C5',
        color: '#ffffff',
      })
    }
  }

  useEffect(() => {
    notification()
  }, [socketSessionId])

  return (
    <div className='firstScreen'>
      <Header />
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
      <ToastContainer position='top-left' delay={8000}/>
    </div>
  )
}

