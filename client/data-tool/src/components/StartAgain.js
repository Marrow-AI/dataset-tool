import React, {useEffect} from 'react';
import { scroller } from "react-scroll";

export default function StartAgain() {

  const scrollToSection = () => {
    scroller.scrollTo("endScreentext", {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
    });
  };

  useEffect(() => {
    scrollToSection()
  }, [])

  return(
    <div className="popup">
      <div className="endScreenDiv">
        <p className="endScreentext">Once you have curated and selected the desired images <br/>
        please send them to <a className="email" href="mailto:socialdataset@gmail.com">socialdataset@gmail.com</a>. <br/> <br/>
        We will train an AI based on the collaborative effort 
        and publish the model with the results! </p> 
        <div className='btnEnd'>
        <a href='/'> 
        <button className="logo-end">Start again?</button></a>
        <a href='https://latentspace.tools' target="_blank" rel="noopener noreferrer">  
          <button className="logo-end">Explore Latent Space</button>
        </a>
        </div>
        </div>
    </div>
  )
}