import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import store from '../state';

export default function DisplayImage() {
  const keyword = useSelector(state => state.keyword);
  const socket = useSelector(state => state.socket);
  const corsServer = 'https://clump.systems/'; // avner change this to cors fetch in python! 
  let history = useHistory();

  const [searchImages, setImages] = useState([]);
  const [count, setCount] = useState()
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
      
        setImages([...searchImages, imageUrl]);
        store.dispatch({
          type: 'SAVE_BASE64',
          image64: searchImages
        })
        setCount(searchImages.length + 1);
      });
    }
    return () => {
      if (socket) {
        socket.off('image');
      }
    }
  });

  return (
      <div className='secondScreen'>
        <div className='leftSection'>
          <h1 className='title result'>2.Results for:<span className='title result-before'>{keyword}</span> </h1>
          <p className='noImages'>No.images found:<span className="number"> {count}</span></p><br />
          <div className='explaining'>
            <p className='explain main'>What you just did was an example for <strong>Data Scraping</strong>.</p>
            <p className='explain two'>Data Scraping is a technique in which a computer program extracts data usually from another program,<br /> <strong>in our case: Google Images</strong>.</p>
            <p className='explain two'> This is a common techniqe when trying to collecting Machine Learning datasets.</p>
            <p className='explain two'>Next step will be cleaning and orginaizing our data</p>
            <button disabled={visiblebtn} className='more' onClick={showEdit}>Keep going?</button>
          </div>
        </div>

        <div className='imageContainer'>
          <div className='images'>
            {searchImages.map(imageUrl => (
              <div key={imageUrl}>
                <img src={imageUrl} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}