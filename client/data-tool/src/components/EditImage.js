import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import useSpinner from './useSpinner';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import store from '../state';
import { name } from "file-loader";
const corsServer = 'https://clump.systems/'; // avner change this to cors fetch in python! 

//this belongs to material-ui//
const useStyles = makeStyles((theme) => ({
  root: {
    id: 1,
    width: 200
  },
  margin: {
    height: theme.spacing(3),
  }
}));

const useStylesTwo = makeStyles((theme) => ({
  root: {
    id: 2,
    width: 300
  },
  margin: {
    height: theme.spacing(3),
  }
}));

const marks = [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 },
{ value: 6 }, { value: 7 }, { value: 8 }, { value: 9 }, { value: 10 }];

function valueLabelFormat(value) {
  return marks.findIndex((mark) => mark.value === value);
}
//until here - material-ui// 

export default function EditImage() {
  const keyword = useSelector(state => state.keyword);
  const images64 = useSelector(state => state.images64);

  const { register, handleSubmit} = useForm({ mode: "onBlur" });
  let history = useHistory();
  const classesOne = useStyles();
  const classesTwo = useStylesTwo();
  const [boxValue, setBoxValue] = useState({ checked: true });
  const [visiblebTraining, setvisibleTraining] = useState(false)
  const [loading, showLoading, hideLoading] = useSpinner();
  const [buttonText, setButtonText] = useState('Give it a go?')
  const [valueNumberOfPeople, setValueNumberOfPeople] = useState(0)
  const [valueNumberofVersions, setNumberofVersions] = useState(0)

  const changeButtonText = (text) => setButtonText(text);

  function valuetext(valueNumberOfPeople) {
    console.log(valueNumberOfPeople)
    return `${valueNumberOfPeople}`;
  }

  function valuetextTwo(valueNumberofVersions) {
    console.log(valueNumberofVersions)
    return `${valueNumberofVersions}`;
  }

  function handlePersonChange(event, newValue) {
    setValueNumberOfPeople(newValue);
  }

  function handleVersionChange(event, newValue) {
    setNumberofVersions(newValue);
  }

function foo(){
  for( let singleImg of images64) {
    console.log(singleImg)
    return singleImg
  }
}

function fetch (singleImg) {
  foo()
  console.log('click')
  console.log()
  fetch('http://52.206.213.41:22100/pose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: singleImg,
      numOfPeople: `${valueNumberOfPeople}`,
      numOfPermutations: `${valueNumberofVersions}`,
    })
   })
  .then(res => {
    if (res.ok) {
      return res.json();
    } else {
      return res.text().then(text => { throw new Error(text); });
    }
  }).then((data) => {
      for( let imageText of data.result) {
        let resultImage = new Image();
        resultImage.src = imageText;
        store.dispatch({
          type: 'CROP_IMAGE',
          cropImages: resultImage
        })
      } 
    })
}

  async function onSubmit() {
   fetch()
    console.log('moving to results')
    showLoading();
    setTimeout(() => {
      hideLoading()
      history.push("/results")
    }, 2000);
  }

  const goTrain = () => {
    console.log('train me!')
    // history.push("/train")
  }

  return (
    <div className='secondScreen'>

      <div className='leftSection'>
        <h1 className='title result'>3.Editing<span className='title result-before'>{keyword}</span> </h1>
        <p className='noImages'>No.images found:<span className="number"> {images64.length}</span></p><br />
        <div className='explaining'>
          <p className='explain main'>Now we are entering a "cleaning" and "editing" stage.</p>
          <p className='explain two'>As you can see, the images you received are variety in their angles, alignment, numbers of figures.</p>
          <p className='explain two'> For the network to be able to identify patterns, we need to help it a bit.</p> <br />
        </div>

        <div className='editForm'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={classesOne.root.id}>
              <Typography className="label" id="track-false-slider-one" htmlFor="num-of-people" gutterBottom>
                Number of human to leave and extract from background:
            </Typography>
              <Slider
                key={name}
                id="num-of-people"
                name="num-of-people"
                value={valueNumberOfPeople}
                onChange={handlePersonChange} 
                // onDragStop={handleDragStop}
                defaultValue={0}
                valueLabelFormat={valueLabelFormat}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-restrict-one"
                step={null}
                valueLabelDisplay="auto"
                marks={marks}
                aria-labelledby="track-false-slider-one"
                getAriaValueText={valuetext}
                defaultValue={0}
                min={0}
                max={7}
                color="secondary"
              />
              <p className='explain three'> this will leave the number of humans you choose and will seperate them from the background</p>
            </div>

            <div className={classesTwo.root.id}>
              <Typography className="label" id="track-false-slider-two" htmlFor="num-of-people" gutterBottom>
                Number of human to leave and extract from background:
             </Typography>
              <Slider
                key={name}
                id="num-of-permutations"
                name="num-of-permutations"
                value={valueNumberofVersions}
                onChange= {handleVersionChange}
                defaultValue={0}
                valueLabelFormat={valueLabelFormat}
                getAriaValueText={valuetextTwo}
                aria-labelledby="discrete-slider-restrict-two"
                step={null}
                valueLabelDisplay="auto"
                marks={marks}
                aria-labelledby="track-false-slider-two"
                getAriaValueText={valuetextTwo}
                defaultValue={0}
                min={0}
                max={10}
              // color="secondary"
              />
              <p className='explain three'> this will shuffle the humans in each image, and will multiple the number of images</p>
            </div>

            {loading}

            <button id="crop-button" className='start' name="end" type="submit" ref={register}>{buttonText}</button>
            <button disabled={!visiblebTraining} className='start train' name="train" onClick={goTrain}>Start Training</button>
          </form>
        </div>
      </div>

      <div className='imageContainer'>
        <div className='images'>
          {images64.map((image, index) =>
            <img key={index} src={image} alt='' />)}
        </div>
      </div>
    </div>
  )
}
