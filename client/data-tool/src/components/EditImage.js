import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux'

export default function EditImage() {
  const socket = useSelector(state => state.socket)
  const [searchImages, setImages] = useState([]);


  useEffect(() => {
    if (socket) {
      socket.off('image');
      socket.on('image', (data) => {
        setImages([...searchImages, data]);
      });
    }
  })

  return (
    <div>
      {searchImages.map(data => (
        <div key={data.url}>
          <div>
            <img src={data.url} alt="" />
          </div>
        </div>
      ))}
    </div>
  );
}