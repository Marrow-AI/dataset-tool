import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import useSpinner from './useSpinner';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import store from '../state';
const corsServer = 'https://clump.systems/'; // avner change this to cors fetch in python! 


//this belongs to material-ui//
const useStyles = makeStyles((theme) => ({
  root: {
    width: 250
  },
  margin: {
    height: theme.spacing(3),
  }
}));
const marks = [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }];

function valueLabelFormat(value) {
  return marks.findIndex((mark) => mark.value === value);
}
//until here - material-ui// 

export default function EditImage() {
  const keyword = useSelector(state => state.keyword);
  const images64 = useSelector(state => state.images64); 
  
  const { register, handleSubmit } = useForm({ mode: "onBlur" });
  let history = useHistory();
  const classes = useStyles();
  const [boxValue, setBoxValue] = useState({ checked: true });
  const [visiblebtn, setVisiblebtn] = useState(false)
  const [visiblebTraining, setvisibleTraining] = useState(false)
  const [loading, showLoading, hideLoading] = useSpinner();
  const [buttonText, setButtonText] = useState('Give it a go?')

  const changeButtonText = (text) => setButtonText(text);

  const handleChange = (event) => {
    setBoxValue({ ...boxValue, [event.target.name]: event.target.checked });
  };

  function valuetext(value) {
    // setValueRange(value)
    return `${value}`;
  }

  async function onSubmit() {
    console.log('click')


    showLoading();
    setTimeout(() => {
      hideLoading()
    }, 2000);
    changeButtonText('Try Again?');
    setvisibleTraining(true)
    console.log('editing images now')
  }

  const goTrain = () => {
    console.log('train me!')
    history.push("/train")
  }   

  return (
    <div className='secondScreen'>
      <div className='leftSection'>
        <h1 className='title result'>2.Results for:<span className='title result-before'>{keyword}</span> </h1>
        <p className='noImages'>No.images found:<span className="number"> {images64.length}</span></p><br />
        <div className='explaining'>
          <p className='explain main'>Now we are entering a "cleaning" and "editing" stage.</p>
          <p className='explain two'>As you can see, the images you received are variety in their angles, alignment, numbers of figures.</p>
          <p className='explain two'> For the network to be able to identify patterns, we need to help it a bit.</p>
        </div>
      </div>

      <div className='editForm'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={classes.root}>
            <Typography className="label" id="track-false-slider" gutterBottom>
              Number of human to leave and extract from background:
            </Typography>
            <Slider
              defaultValue={0}
              valueLabelFormat={valueLabelFormat}
              getAriaValueText={valuetext}
              aria-labelledby="discrete-slider-restrict"
              step={null}
              valueLabelDisplay="auto"
              marks={marks}
              aria-labelledby="track-false-slider"
              getAriaValueText={valuetext}
              defaultValue={0}
              min={0}
              max={7}
              color="secondary"
            />
          </div>

          <p className='explain three'> this will leave the number of humans you choose and will seperate them from the background</p>
          <FormControlLabel
            control={<Checkbox checked={boxValue.unchecked}
              onChange={handleChange}
              name="checked" />} label="Augment Images" />
          <p className='explain three'> this will shuffle the humans in each image, and will multiple the number of images</p>
          {loading}
          <button className='start' name="start" type="submit" ref={register}>{buttonText}</button>
          <button disabled={!visiblebTraining} className='start train' name="train" onClick={goTrain}>Start Training</button>
        </form>
      </div>

     <div className='imageContainer'>
          <div className='images'>
            {images64.map((image,index) =>
            <img key={index} src={image} alt=''/> )
            }

          </div>
        </div>

    </div>

  )
}
