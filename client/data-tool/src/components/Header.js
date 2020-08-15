import React from 'react';

export default function Header() {
  console.log("Header!");
  return (
    <div className="header">
      <h1 className="logo">DATASET TOOL</h1>
      <p className='explain'>Imagine!! Hmm how a neural network would re-create images based on abstract ideas.</p>
      <p className='explain'>Ideas that are more like feelings or experiences; like <span className="example">Love, Family, Sadness, Team-players...</span></p>  
      <p className='explain'>How would it be? What images would you look for to rpresent these ideas?</p>
    </div>
  )
}
