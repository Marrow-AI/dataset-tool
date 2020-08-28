import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import useSpinner from './useSpinner';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import store from '../state';
import { name } from "file-loader";
import getPoses from '../poseRequest';
import { createMuiTheme } from '@material-ui/core/styles';
//this belongs to material-ui//
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#84ffff',
    },
    secondary: {
      main: '#fff',
    },
  },
});

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

const tracks = [{ value: 0, label: '0' }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4, label: '4' }];
function valueLabelFormatOne(value) {
  return tracks.findIndex((track) => track.value === value);
}

const marks = [{ value: 0, label: '0' }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 },
{ value: 6 }, { value: 7 }, { value: 8 }, { value: 9 }, { value: 10, label: '10' }];

function valueLabelFormat(value) {
  return marks.findIndex((mark) => mark.value === value);
}
//until here - material-ui// 

export default function EditImage() {
  const keyword = useSelector(state => state.keyword);
  const images64 = useSelector(state => state.images64);
  const { register, handleSubmit } = useForm({ mode: "onBlur" });
  let history = useHistory();
  const classesOne = useStyles();
  const classesTwo = useStylesTwo();
  const [loading, showLoading, hideLoading] = useSpinner();
  const [buttonText, setButtonText] = useState('Give it a go?')
  const [valueNumberOfPeople, setValueNumberOfPeople] = useState(1)
  const [valueNumberofVersions, setNumberofVersions] = useState(0)

  function valuetext(valueNumberOfPeople) {
    return `${valueNumberOfPeople}`;
  }

  function valuetextTwo(valueNumberofVersions) {
    return `${valueNumberofVersions}`;
  }

  function handlePersonChange(event, newValue) {
    setValueNumberOfPeople(newValue);
  }

  function handleVersionChange(event, newValue) {
    setNumberofVersions(newValue);
  }

  async function onSubmit() {
    console.log('moving to results');
    store.dispatch({
      type: 'SAVE_VALUE_SLIDER',
      numberPeople: valueNumberOfPeople,
      numberVersions: valueNumberofVersions
    });
    store.dispatch(async (dispatch, getState) => {
      try {
        showLoading();
        const { images64, numberPeople, numberVersions } = getState();
        for (const singleImg of images64) {
          try {
            const data = await getPoses(singleImg, numberPeople, numberVersions)
            for (let imageText of data.results) {
              dispatch({
                type: 'CROP_IMAGE',
                cropImages: "data:image/jpg;base64," + imageText
              })
            }
          } catch (e) {
            console.log(e);
          } finally {
            hideLoading();
            history.push(`/results/${numberPeople}/${numberVersions}`)
          }
        }

      } catch (e) {
        console.log('error:  ', e);
      }
    });
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <div className="mainTitle">
        <h1 className='title result'>Editing <span className="number edit"> {images64.length + 1}</span> images with the result of <span className='title result-before edit'>{keyword}</span> </h1>
        <div className='secondScreen'>
          <div className='leftSection edit'>
            <div className='explaining edit'>
              <h2 className='explain main edit'>Step Three: Cleaning & Editing stage</h2>
              <p className='explain two'>Even though the images are similar in their topic, they are very different in their feature: different angles, numbers of figures, colors.</p>
              <p className='explain two'> This creates a lot of noise for the network, and difficulty to identify patterns.<br /> We need to help it a bit.</p> <br />

              <div className='editForm'>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className={classesOne.root}>
                    <Typography className="label" id="track-false-slider-one" htmlFor="num-of-people" gutterBottom>
                      1 ● How many humans to leave<br /> & extract from background?
             </Typography>
                    <Slider
                      key={name}
                      id="num-of-people"
                      name="num-of-people"
                      value={valueNumberOfPeople}
                      onChange={handlePersonChange}
                      // onDragStop={handleDragStop}
                      defaultValue={1}
                      valueLabelFormat={valueLabelFormatOne}
                      getAriaValueText={valuetext}
                      aria-labelledby="discrete-slider-restrict-one"
                      step={null}
                      valueLabelDisplay="auto"
                      marks={tracks}
                      // aria-labelledby="track-false-slider-one"
                      min={0}
                      max={4}
                    // color="secondary"
                    />
                    <p className='explain three'> this will leave the number of humans you choose and will seperate them from the background</p>
                  </div>

                  <div className={classesTwo.root}>
                    <Typography className="label" id="track-false-slider-two" htmlFor="num-of-people" gutterBottom>
                      2 ● How many versions to create<br /> from each image?
             </Typography>
                    <Slider
                      key={name}
                      id="num-of-permutations"
                      name="num-of-permutations"
                      value={valueNumberofVersions}
                      onChange={handleVersionChange}
                      defaultValue={0}
                      valueLabelFormat={valueLabelFormat}
                      getAriaValueText={valuetextTwo}
                      aria-labelledby="discrete-slider-restrict-two"
                      step={null}
                      valueLabelDisplay="auto"
                      marks={marks}
                      // aria-labelledby="track-false-slider-two"
                      min={0}
                      max={10}
                    // color="secondary"
                    />
                    <p className='explain three'> this will shuffle the humans in each image, and will multiple the number of images</p>
                  </div>

                  {loading}

                  <div className="btns">
                    <button id="crop-button" className='start' name="end" type="submit" ref={register}>{buttonText}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className='imageContainer'>
            <div className='images'>
              {images64.map((image, index) =>
                <img key={index} src={image} alt='' />)}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
