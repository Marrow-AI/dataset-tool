import React, { useState } from 'react';
import Search from './Search';
import DisplayImage from './DisplayImage';

export default function SearchContainer(){
  const [currentComponent, setCurrentComponent] = useState('search')
  
  function showCurrentComponent() {
   if (currentComponent === 'display') {
        return (
          <DisplayImage />
        )
      }
  }
  
  return (
    <>
  <Search showNext={() => setCurrentComponent('display')}/>
   {showCurrentComponent()}
   <p>{currentComponent}</p>
   </>
  )
}