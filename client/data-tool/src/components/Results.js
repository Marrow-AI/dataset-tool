import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import store from '../state';

export default function Results(props) {
  const keyword = useSelector(state => state.keyword);
  const socket = useSelector(state => state.socket);
  const cropImages = useSelector(state => state.cropImages);
  const images64 = useSelector(state => state.images64);

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
    fetchPoses();
  },[]);


  async function fetchPoses () {
    const {numOfPeople, numOfPermutations} = props.match.params;
    console.log('fetching poses ', numOfPeople, numOfPermutations);

    for( const singleImg of images64) {
      const res = await fetch('http://52.206.213.41:22100/pose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: singleImg,
          numOfPeople,
          numOfPermutations
        })
      })
      if (res.ok) {
        const data = await res.json();
        for( let imageText of data.results) {
          store.dispatch({
            type: 'CROP_IMAGE',
            cropImages: "data:image/jpg;base64," + imageText
          })
        } 
      } else {
        const text = await res.text();
        throw new Error(text); 
      }
    }
  }

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
