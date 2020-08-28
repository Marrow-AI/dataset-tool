import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { saveAs } from "filesaver.js-npm";
import JSZip from 'jszip';

export default function Results(props) {
  const keyword = useSelector(state => state.keyword);
  const cropImages = useSelector(state => state.cropImages);
  const [showModel, setShowModel] = useState(false);
  const [visible, setDisible] = useState(false)

  function downloadFile(url) {
    return new JSZip.external.Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function() {
        // you should handle non "200 OK" responses as a failure with reject
        resolve(xhr.response);
      };
      // you should handle failures too
      xhr.open('GET', url);
      xhr.send();
    });
  }

    function saveToZip () {
      const zip = new JSZip()
      zip.file("ReadMe.txt", "These are the images you have collected from www.dataset.marrow\nPlease respect the original creators' rights© and remember to check your own bias before training. \nOther than that, we wish you a happy creation session.¸¸.•*¨*•"); //some info
      let img = zip.folder('Your_Images');
      cropImages.map((item, i) => {
        let image = item.slice(0);
        let promise = downloadFile(image);
        img.file("image" + [i] + ".jpg", promise);
      });
      zip.generateAsync({type:"blob"}).then(function(content) {
          saveAs(content, "Marrow_DataTool.zip");
      }); 
    }



  return (
    <div className="mainTitle">
      <h1 className='title result'>Final results for what was <span className='title result-before final'>{keyword}</span> </h1>
      <div className='secondScreen'>
        <div className='leftSection result'>
          <div className='explaining result'>
            <h2 className='explain main edit'>Step Four: Moment before training</h2>
            <p className='explain two'>Now will be a stage where we will manually curate the images we received.<br />
             Checking what kind of "human's bodies" the Neural Network sent back.</p>
            <p className='explain two'> Another important aspect we should keep in mind
             is the diversity of the dataset &mdas; is it represent all we need?  </p>
            <p className='explain two'>If everything is Okay and we are pleased, we are proceeding with toward Training. </p>
            <button disabled={visible} className='more' onClick={saveToZip}>let's train</button>

            {/* <button disabled={visible} className='more' onClick={() => setShowModel(!showModel, setDisible(!visible))}>let's train</button> */}
          </div>
        </div>

        {/* {showModel && */}
          {/* <div class="model">
            <h2 className='explain main final'>MSG</h2>
            <p className='explain modelText'>Training is a process that takes days, if not weeks.</p>
            <p className='explain modelText'> The training results you are about to see was done on "Happy Family dinner" dataset. </p>
            <p className='explain modelText'> It took 84 hours on ~6400 images that were collected more or less in this method. </p>
            <button className='more modelText' onClick={saveToZip}>I understand!</button>
          </div> */}
        {/* } */}

        <div className='imageContainer'>
          <div className='images'>
            {cropImages.map((cleanImages, index) => (
              <div key={index}>
                <img src={cleanImages} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
