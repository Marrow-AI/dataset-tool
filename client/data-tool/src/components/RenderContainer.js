import React, { useState } from 'react';
import Search from './Search';
import DisplayImage from './DisplayImage';
import EditImage from './EditImage';

export default function RenderContainer() {
  const [currentComponent, setCurrentComponent] = useState('search')

  function showCurrentComponent() {
    if (currentComponent === 'display') {
      return (
        <DisplayImage showNext={() => setCurrentComponent('edit')}/>
      )
    } else if (currentComponent === 'edit') {
      return (
        <EditImage />
      )
    }
  }

  return (
    <>
      <Search showNext={() => setCurrentComponent('display')} />
      {showCurrentComponent()}
      <p>{currentComponent}</p>
    </>
  )
}