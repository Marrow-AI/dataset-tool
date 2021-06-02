import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { saveAs } from "filesaver.js-npm";
import JSZip from 'jszip';
import StartAgain from "./StartAgain";

export default function Results(props) {
  const keyword = useSelector(state => state.keyword);
  const cropImages = useSelector(state => state.cropImages);
  const [visible, setDisible] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [hasClassName, setClassName] = useState(true);

  function downloadFile(url) {
    return new JSZip.external.Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function () {
        // you should handle non "200 OK" responses as a failure with reject
        resolve(xhr.response);
      };
      // you should handle failures too
      xhr.open('GET', url);
      xhr.send();
    });
  }

  function saveToZip() {
    const zip = new JSZip()
    zip.file("ReadMe.txt", "These are the images you have collected from www.dataset.tips\nPlease respect the original creators' rights© and remember to check your own biases before training. \nOther than that, we wish you a happy creation session.¸¸.•*¨*• \n shirin anlen and Avner Peled"); //some info
    let img = zip.folder('Your_Images');
    cropImages.map((item, i) => {
      let image = item.slice(0);
      let promise = downloadFile(image);
      img.file("image" + [i] + ".jpg", promise);
    });
    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "Marrow_DataTool.zip");
    });
    setShowPopUp(true)
    window.location.href = '/#start-again'
    setClassName(false)
  }

  useEffect(() => {
    window.location.href = '/#curation-section'
  }, [])

  return (
    <div className="mainTitle">
      <div className='secondScreen'>
        <div className='leftSection'>
          <h2 className='explain-number'> 1.</h2>
          <h2 id='curation-section' className='explain-number'>Data Scraping</h2>
          <h2 className='explain-number'> 2. </h2>
          <h2 className='explain-number'> Editing</h2>
          <h2 className='explain-number'> 3. </h2>
          <h2 className={hasClassName ? "explain main result" : "explain-number"}>Curation</h2>

          <div className='explaining result'>
            <p className='explain two'>Creating a dataset usually includes a human selection process, in which we manually curate the data. </p>
            <p className='explain two'> In this stage, we remove unrelated images that may skew the learning process and make sure the data adequately represents your idea of reality.</p> <br />
            <div className='explain two'>If you are pleased iwth the results, the next stage would be to <div className="modelHover"> train </div>
              a suitable machine learning model on this set of images.
              <div className="modelImage">
                <p className='explain three-image'>*This is from "Happy Families Dinner" dataset training process</p>
              </div>
            </div>
            <button className='more download' onClick={saveToZip}> DOWNLOAD RESULTS </button>
            <p className='explain three resutls'>*Note, this is still a tiny dataset&mdash;datasets require additional techniques to go over thousands of images.</p>
          </div>
        </div>
        <div className='imageContainer'>
          <h1 className='title result'>Final results for what was <span className='title result-before'>{keyword}</span> </h1>
          <div className='images results'>
            {cropImages.map((cleanImages, index) => (
              <div key={index}>
                <img src={cleanImages} alt="" />
              </div>
            ))}
          </div>
          <div id='start-again'>
            {showPopUp ?
              <StartAgain /> : ""}
          </div>
        </div>
      </div>
    </div>
  )
}
