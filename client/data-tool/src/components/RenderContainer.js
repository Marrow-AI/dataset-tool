import React, { useState } from 'react';
import Search from './Search';
import DisplayImage from './DisplayImage';
import EditImage from './EditImage';
import Results from './Results';
import StartAgain from './StartAgain';


export default function RenderContainer() {
  const [currentComponent, setCurrentComponent] = useState('search')
  const [numberPeople, setNumberPeople] = useState()
  const [numberVersions, setNumberVersions] = useState()
  
  function showCurrentComponent() {
    if (currentComponent === 'display') {
      return (
        <DisplayImage visible={true} showNext={() => setCurrentComponent('edit')}/>
      )
    } else if (currentComponent === 'edit') {
      return (
        <EditImage visible={true}  showNext={() => setCurrentComponent('result')}
         setShowPeople={setNumberPeople}
         setShowVersions={setNumberVersions}/>
      )
    } else if(currentComponent === 'result') {
      return (
      <Results
        visible={true}
        showNumberPeople={numberPeople}
        showNumberVersion={numberVersions}/>
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
