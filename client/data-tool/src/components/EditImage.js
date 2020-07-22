import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux'
import RangeSlider from 'react-bootstrap-range-slider';

export default function EditImage() {
  const keyword = useSelector(state => state.keyword)
  const socket = useSelector(state => state.socket)
  const { register, fakeSubmit } = useForm({ mode: "onBlur" });
  const [searchImages, setImages] = useState([]);
  const [count, setCount] = useState()
  const [keepGoing, setKeepGoing] = useState(false);
  const [ value, setValue ] = useState(0); 

  const handleEdit = (e) => {
    console.log('click')
  }

  useEffect(() => {
    if (socket) {
      socket.off('image');
      socket.on('image', (data) => {
        setImages([...searchImages, data]);
        setCount(searchImages.length + 1);
      });
    }
  })

  return (
    <div className='secondScreen'>
      <div className='leftSection'>
        <h1 className='title result'>2. Results for: {keyword}</h1>
        <p className='noImages'>no.images found:<span className="number"> {count}</span></p><br />
        <div className='explaining'>
        <p className='explain main'>what you just did was an example for <strong>Data Scraping</strong></p>
        <p className='explain two'>Data Scraping is a technique in which a computer program extracts data usually from another program,<br/> <strong>in our case: Google Images</strong>.</p>
        <p className='explain two'> This is a common techniqe when trying to collecting Machine Learning datasets.</p>
        <p className='explain two'>Next step will be cleaning and orginaizing our data</p>
        <button className='more' onClick={() => setKeepGoing(!keepGoing)}>Keep going?</button>
        </div>
        
        {keepGoing && <div className='editForm'>
        <form onSubmit={fakeSubmit}>
          number of humans to extract: <br/> 
          <RangeSlider
           className='rangeSlider'
            min={0}
            max={7}
            tooltip='auto'
            variant='dark'
            value={value}
            onChange={changeEvent => setValue(changeEvent.target.value) }
          />
          <p className='explain three'> this will allow you to seperate the human from the background</p>         
          <input className="check" type="checkbox" id="augment" name="augment"/>
          <label htmlFor="augment"> augment image</label><br />
          <p className='explain three'> this will allow you to seperate the human from the background</p>         

          <button className='start' name="start" onClick={handleEdit} ref={register}> Start </button>
        </form>
        </div>}
      </div>

      <div className='imageContainer'>
        <div className='images'>
          {searchImages.map(data => (
            <div key={data.url}>
              <img src={data.url} alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}