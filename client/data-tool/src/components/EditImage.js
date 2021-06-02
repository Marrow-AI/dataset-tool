import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3F51B5',
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

const tracks = [{ value: 1, label: '1' }, { value: 2, label: '2'  }, { value: 3, label: '3'  }, { value: 4, label: '4' }];

function valueLabelFormatOne(value) {
  return tracks.findIndex((track) => track.value === value);
}

const marks = [{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3,  label: '3' }, { value: 4,  label: '4' }, { value: 5, label: '5'},
{ value: 6,  label: '6' }, { value: 7,  label: '7' }, { value: 8,  label: '8' }, { value: 9,  label: '9' }, { value: 10, label: '10' }];

function valueLabelFormat(value) {
  return marks.findIndex((mark) => mark.value === (value));
}

export default function EditImage(props) {
  const keyword = useSelector(state => state.keyword);
  const images64 = useSelector(state => state.images64);
  const { register, handleSubmit } = useForm({ mode: "onBlur" });
  const classesOne = useStyles();
  const classesTwo = useStylesTwo();
  const [loading, showLoading, hideLoading] = useSpinner();
  const [valueNumberOfPeople, setValueNumberOfPeople] = useState(1)
  const [valueNumberofVersions, setNumberofVersions] = useState(0)
  const { showNext, setShowPeople, setShowVersions } = props;


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
            setTimeout(() => {
              hideLoading()
              setShowPeople(numberPeople)
              setShowVersions(numberVersions)
              showNext();
            }, 2000);
          }
        }

      } catch (e) {
        console.log('error:  ', e);
      }
    });
  }

  useEffect(() => {
    window.location.href = '/#edit-section'
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <div className='secondScreen'>
        <div className='leftSection edit'>
          <div className='explaining-title'>
            <h2 className='explain-number'> 1.</h2>
            <h2 id='edit-section' className='explain-number'> Data Scraping</h2>
            <h2 className='explain-number'> 2.</h2>
            <h2 className='explain main'>Editing</h2>
          </div>
          <div className='explain-paragraph'>
            <p className='explain two'>Even though the images are similar in topic, they are very different in their features: different backgrounds, camera angles, characters’ positions.</p>
            <p className='explain two'> This creates a lot of noise for the neural network, making it difficult to identify patterns. We need to help it a bit. </p>
            <p className='explain two'> We can use Computer Vision to extract the humans from the photo and place them in fixed locations.
            We can then augment the dataset by shuffling the humans’ positions, creating several variations of the same image.</p> 
            <p className='explain two'>Please choose how many humans you would like each image to have and how many variations you would like to create from each image.</p>
          </div>
        </div>
        <div className='edit-imageContainer'>
          <div className='imageContainer'>
            <h1 className='title result'>Editing <span className="number"> {images64.length + 1}</span> images for <span className='title result-before'>{keyword}</span> </h1>
            {loading}
            <div className='images'>
              {images64.map((image, index) =>
                <img key={index} src={image} alt='' />)}
            </div>
            <div className='editForm'>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className='edit-slides'>
                  <div className='edit-div'>
                    <div className={classesOne.root}>
                      <Slider
                        key={name}
                        id="num-of-people"
                        name="num-of-people"
                        value={valueNumberOfPeople}
                        onChange={handlePersonChange}
                        defaultValue={1}
                        valueLabelFormat={valueLabelFormatOne}
                        getAriaValueText={valuetext}
                        aria-labelledby="discrete-slider-restrict-one"
                        step={null}
                        valueLabelDisplay="off"
                        marks={tracks}
                        min={1}
                        max={4}
                      />
                      <Typography className="label" id="track-false-slider-one" htmlFor="num-of-people" gutterBottom>
                        Number of humans to extract from background.
                      </Typography>
                      <p className='explain three'> this will clear the background of the images, eliminating noise, and make sure all humans are aligned to the same position.</p>
                    </div>
                  </div>

                  <div className='edit-div'>
                    <div className={classesTwo.root}>
                      <Slider
                        key={name}
                        id="num-of-permutations"
                        name="num-of-permutations"
                        value={valueNumberofVersions}
                        onChange={handleVersionChange}
                        defaultValue={1}
                        valueLabelFormat={valueLabelFormat}
                        getAriaValueText={valuetextTwo}
                        aria-labelledby="discrete-slider-restrict-two"
                        step={null}
                        valueLabelDisplay="off"
                        marks={marks}
                        min={1}
                        max={10}
                      />
                      <Typography className="label" id="track-false-slider-two" htmlFor="num-of-people" gutterBottom>
                        Number of versions to create from each image.
                      </Typography>
                      <p className='explain three'> this will shuffle the humans in every image, creating multiple data from one source</p>
                    </div>
                  </div>
                </div>

                <button id="crop-button" className='btn edit' name="end" type="submit" ref={register}>APPLY</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
