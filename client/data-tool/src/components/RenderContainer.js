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
    return (
      <>
        <DisplayImage
          visible={currentComponent === 'display'}
          showNext={() => setCurrentComponent('edit')}
        />
        <EditImage
         visible={currentComponent === 'edit'}
         showNext={() => setCurrentComponent('result')}
         setShowPeople={setNumberPeople}
         setShowVersions={setNumberVersions}
        />
        <Results
          visible={currentComponent === 'result'}
          showNumberPeople={numberPeople}
          showNumberVersion={numberVersions}
        />
      </>
    ) 
  }

  return (
    <>
      <Search showNext={() => setCurrentComponent('display')} />
      {showCurrentComponent()}
      <p>{currentComponent}</p>
    </>
  )
}
