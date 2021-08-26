import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux';
import { Link, useHistory } from "react-router-dom";
import { scroller } from "react-scroll";
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

const tracks = [{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }];

function valueLabelFormatOne(value) {
  return tracks.findIndex((track) => track.value === value);
}



function factorialize(num) {
  if (num < 0)
        return -1;
  else if (num === 0)
      return 1;
  else {
      return (num * factorialize(num - 1));
  }
}

export default function EditImage(props) {
  const keyword = useSelector(state => state.keyword);
  const imageUrls = useSelector(state => state.imageUrls);
  const socket = useSelector(state => state.socket);
  const socketSessionId = useSelector(state => state.socket ? state.socket.id : 0)
  const { register, handleSubmit } = useForm({ mode: "onBlur" });
  const classesOne = useStyles();
  const classesTwo = useStylesTwo();
  const [loading, showLoading, hideLoading] = useSpinner();
  let history = useHistory();
  const [valueNumberOfPeople, setValueNumberOfPeople] = useState(1)
  const [valueNumberofVersions, setNumberofVersions] = useState(1)
  const [maxVersions, setMaxVersions] = useState(1)
  const [versionMarks, setVersionMarks] = useState([{ value: 1, label: '1' }]);
  const { showNext, setShowPeople, setShowVersions } = props;

  function valueLabelFormat(value) {
    return versionMarks.findIndex((mark) => mark.value === (value));
  }

  function valuetext(valueNumberOfPeople) {
    return `${valueNumberOfPeople}`;
  }

  function valuetextTwo(valueNumberofVersions) {
    return `${valueNumberofVersions}`;
  }

  function handlePersonChange(event, newValue) {
    setValueNumberOfPeople(newValue);
    const maxVersions = Math.min(10,factorialize(newValue));
    setMaxVersions(maxVersions);
    const newMarks = [...Array(maxVersions).keys()].map(x => ({value: x + 1, label: (x + 1).toString()}));
    setVersionMarks(newMarks);
  }

  function handleVersionChange(event, newValue) {
    setNumberofVersions(newValue);
  }

  function toDataUrl(img) {
    img.crossOrigin = 'anonymous';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = img.naturalHeight;
    canvas.width = img.naturalWidth;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL();
  }

  async function onSubmit() {
    store.dispatch({
      type: 'SAVE_VALUE_SLIDER',
      numberPeople: valueNumberOfPeople,
      numberVersions: valueNumberofVersions
    });
    store.dispatch(async (dispatch, getState) => {
      try {
        showLoading();
        const { imageUrls, numberPeople, numberVersions } = getState();
        try {
          getPoses(imageUrls, keyword, numberPeople, numberVersions, socketSessionId)
        } catch (e) {
          console.warn("Error in pose ", data);
        } finally {
          setTimeout(() => {
            hideLoading()
            history.push(`/results/${numberPeople}/${numberVersions}`)
            // setShowPeople(numberPeople)
            // setShowVersions(numberVersions)
            // showNext();
          }, 100);
        }
      } catch (e) {
        console.log('error:  ', e);
      }
    });
  }

  const scrollToSection = () => {
    scroller.scrollTo("edit-section", {
      duration: 20,
      delay: 0,
      smooth: "easeInOutQuart",
    });
  };

  useEffect(() => {
    scrollToSection()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <div className='secondScreen'>
        <div className='leftSection edit'>
          <div className='explaining-title'>
            <h2 className='explain-number'> 1.</h2>
            <Link to='/display'>
              <h2 className='explain-number hover'> Data Scraping</h2>
            </Link>
            <h2 className='explain-number'> 2.</h2>
            <h2 id='edit-section' className='explain main'>Editing</h2>
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
            <h1 className='title result'>Editing <span className="number"> {imageUrls.length + 1}</span> images for <span className='title result-before'>{keyword}</span> </h1>
            {loading}
            <div className='images'>
              {imageUrls.map((image, index) =>
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
                        marks={versionMarks}
                        min={1}
                        max={maxVersions}
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
