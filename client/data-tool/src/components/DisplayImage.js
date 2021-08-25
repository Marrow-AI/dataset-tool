import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import store from '../state';

export default function DisplayImage(props) {
  const keyword = useSelector(state => state.keyword);
  const socket = useSelector(state => state.socket);
  const corsServer = '/proxy/';
  let history = useHistory();
  const searchImages = useSelector(state => state.imageUrls);
  const [keepGoing, setKeepGoing] = useState(false);
  const [visiblebtn, setVisiblebtn] = useState(false)
  const {showNext} = props;


  async function showEdit(e) {
    e.preventDefault();
    setKeepGoing(!keepGoing, setVisiblebtn(true));
    await fetch('/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    .then(res => res.json())
    .then((data) => {
       console.log("Stop search", data);
       if (data.result === "OK") {
          showNext()
       } else {
          alert(data.result);
       }
    });
  }

  const toDataURL = url => fetch(corsServer + url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }));

  useEffect(() => {
    if (socket) {
      socket.on('image', async (data) => {
        console.log('Received image:', data);
        //const imageUrl = await toDataURL(data.url);
        store.dispatch({
          type: 'SAVE_IMAGE_URL',
          imageUrl: data.url
        })
      });
    }
    return () => {
      if (socket) {
        socket.off('image');
      }
    }
  });

  useEffect(() => {
    window.location.href='/#data-scraping'
  }, [])

  return (
    <div 
      className='secondScreen'
      style={props.visible ? {} : { display: 'none' }}
    >
      <div className='leftSection'>
        <div className='explaining-title'>
          <h2 id='data-scraping' className='explain-number'> 1.</h2>
          <h2 className='explain main'>Data Scraping</h2>
        </div>
        <div className='explain-paragraph'>
          <p className='explain two'>Data Scraping is a technique in which a computer program extracts readable data from a data source. In our case, we scrape the web by extracting links to images from <strong>Google Images</strong>.</p>
          <p className='explain two'>Web Scraping is a common technique for obtaining massive amounts of data required to train a machine learning model. Look at the resulting set of images&mdash;does it contain what you had in mind?</p>
          <p className='explain two'>Once we have assembled the raw data, it has to be post-processed into a meaningful and consistent set of images that our model could easily comprehend.</p>
        </div>
        <br /><br />
        <button disabled={visiblebtn} className='more' onClick={showEdit}>Keep going?</button>
      </div>

      <div className='imageContainer'>
        <h1 className='title result'><span className="number"> {searchImages.length}</span> images found for <span className='title result-before'>{keyword}</span> </h1>
        <div className='images'>
          {searchImages.map((imageUrl, index) => (
            <div key={index}>
              <img src={imageUrl} alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
