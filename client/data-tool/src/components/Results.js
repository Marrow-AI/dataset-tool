import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import store from '../state';

export default function Results() {
  const keyword = useSelector(state => state.keyword);
  const socket = useSelector(state => state.socket);
  const cropImages = useSelector(state => state.cropImages);

  const corsServer = 'https://clump.systems/'; // avner change this to cors fetch in python! 
  let history = useHistory();
  const [cleanImages, setCleanImages] = useState()
  const [visiblebtn, setVisiblebtn] = useState(false)

  const goTrain = () => {
    console.log('train me!')
    history.push("/train")
  }


  //   showLoading();
  //   setTimeout(() => {
  //     hideLoading()
  //   }, 2000);
  //   changeButtonText('Try Again?');
  //   setvisibleTraining(true)

  // }

  useEffect(() => {
    if (socket) {
      socket.on('image', async (data) => {
         setCleanImages(data.url)
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
          {/* <p className='noImages'>No.images found:<span className="number"> {cleanImages.length + 1}</span></p><br /> */}
          <div className='explaining'>
            <p className='explain main'>What you just did was an example for <strong>Data Scraping</strong>.</p>
            <p className='explain two'>Data Scraping is a technique in which a computer program extracts data usually from another program,<br /> <strong>in our case: Google Images</strong>.</p>
            <p className='explain two'> This is a common techniqe when trying to collecting Machine Learning datasets.</p>
            <p className='explain two'>Next step will be cleaning and orginaizing our data</p>
            <button disabled={visiblebtn} className='more' onClick={goTrain}>let's train</button>
          </div>
        </div>

        <div className='imageContainer'>
          <div className='images'>
            {cropImages.map((cleanImages,index) => (
              <div key={index}>
                <img src={cleanImages} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    
)
}