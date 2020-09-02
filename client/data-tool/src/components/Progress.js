import React, { useState } from "react";

export default function Progress({done}) {
  const [style, setStyle] = useState({}) ;

  setTimeout(() => {
    const newwStyle = {
      opacity: 1, 
      width: `{done}%`
    }
    setStyle(newwStyle)
  }, 1000)

  return(
    <div className='progress'>
      <div className='progress-done' style={style}>{done}</div>
    </div>
  )
}
