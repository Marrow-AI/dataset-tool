import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import store from '../state';

export default function DisplayImage() {
  const keyword = useSelector(state => state.keyword);
  const socket = useSelector(state => state.socket);
  const corsServer = '/proxy/';
  let history = useHistory();
  const searchImages = useSelector(state => state.images64);
  const [keepGoing, setKeepGoing] = useState(false);
  const [visiblebtn, setVisiblebtn] = useState(false)


  function showEdit(e) {
    e.preventDefault();
    setKeepGoing(!keepGoing, setVisiblebtn(true));
    history.push("/edit")
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
        const imageUrl = await toDataURL(data.url);
        store.dispatch({
          type: 'SAVE_BASE64',
          image64: imageUrl
        })
      });
    }
    return () => {
      if (socket) {
        socket.off('image');
      }
    }
  });

  return (
    <div className="mainTitle">
      <h1 className='title result'><span className="number"> {searchImages.length + 1}</span> images found for <span className='title result-before'>{keyword}</span> </h1>
      <div className='secondScreen'>
        <div className='leftSection'>
          <div className='explaining'>
            <h2 className='explain main'>First step: Data Scraping</h2>
            <p className='explain two'>Data Scraping is a technique in which a computer program extracts readable data from a data source. In our case, we scrape the web by extracting links to images from <strong>Google Images</strong></p>
						<p className='explain two'> Web Scraping is a common technique for obtaining massive amounts of data required to train a machine learning model.</p>
            <p className='explain two'>Once we collected all of the data, the next step will be to extract a meaningful and consistent set of images that the model could easily comprehend.</p>
            <button disabled={visiblebtn} className='more' onClick={showEdit}>Keep going?</button>
          </div>
        </div>

        <div className='imageContainer'>
          <div className='images'>
            {searchImages.map((imageUrl, index) => (
              <div key={index}>
                <img src={imageUrl} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
