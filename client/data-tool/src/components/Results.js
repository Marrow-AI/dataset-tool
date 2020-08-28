import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { saveAs } from "filesaver.js-npm";
import JSZip from 'jszip';

export default function Results(props) {
  const keyword = useSelector(state => state.keyword);
  const cropImages = useSelector(state => state.cropImages);
  const [visible, setDisible] = useState(false)
  const [ showPopUp, setShowPopUp] = useState(false)

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
    zip.file("ReadMe.txt", "These are the images you have collected from www.dataset.marrow\nPlease respect the original creators' rights© and remember to check your own bias before training. \nOther than that, we wish you a happy creation session.¸¸.•*¨*•"); //some info
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
  }

  return (
    <div className="mainTitle">
      <h1 className='title result'>Final results for what was <span className='title result-before final'>{keyword}</span> </h1>
      <div className='secondScreen'>
        <div className='leftSection result'>
          <div className='explaining result'>
            <h2 className='explain main result'>Step Four: Curation</h2>
            <p className='explain two'>Now will be a stage where we will manually curate the images we received.<br />
            Checking what kind of "human's bodies" the Neural Network sent back and deciding what fits the purpose.</p> <br />
            <button disabled={visible} className='more' onClick={saveToZip}> DOWNLOAD RESULTS </button>
            <p className='explain three resutls'>*This is still a tiny dataset and just a sample of one &mdash; but can be a good practice.</p>
            <p className='explain two'>Naturally, if everything is Okay and we are pleased, we would proceed after to the<div className="modelHover"> Training stage.</div>
              <div className="modelImage">
                <p className='explain three-image'>*This is from "Happy Families Dinner" dataset training process</p>
              </div>
            </p>

            <p className='explain two'> For that, another important aspect we should keep in mind is the diversity of the dataset
               &mdash; does it represent all we need? </p>
          </div>
        </div>

      {showPopUp ? <div className="popup">
         <a href='/'> <h1 className="logo end">Start again?</h1></a>
        </div> : ""}

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
