import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux'

export default function EditImage() {
  const keyword = useSelector(state => state.keyword)
  const socket = useSelector(state => state.socket)
  const { register, fakeSubmit } = useForm({ mode: "onBlur" });
  const [searchImages, setImages] = useState([]);
  const [count, setCount] = useState()

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
        <h1>2. {keyword}</h1>
        <p>some explanation</p> <br />
        <p>number of images: {count}</p><br />
        <form onSubmit={fakeSubmit}>
          number of humans to extract <input id="extract" type="number" name="extract" /><br />
          <input type="checkbox" id="augment" name="augment"/>
          <label htmlFor="augment"> augment image</label><br />
          <button name="start" className="start" onClick={handleEdit} ref={register}> Start </button>
        </form>
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