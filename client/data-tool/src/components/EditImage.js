import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import useSpinner from './useSpinner.js';
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

export default function EditImage() {
  let history = useHistory();
  const socketSessionId = useSelector(state => state.socket ? state.socket.id : 0)
  const keyword = useSelector(state => state.keyword);
  const socket = useSelector(state => state.socket);
  const storingDataSassion = useSelector(state => state.storingDataSassion);
  const { register, handleSubmit } = useForm({ mode: "onBlur" });
  const [searchImages, setImages] = useState([]);
  const [count, setCount] = useState()
  const [keepGoing, setKeepGoing] = useState(false);
  const [boxValue, setBoxValue] = useState({ checked: true });
  const [visibleTrain, setvisibleTrain] = useState(true)
  const [loading, showLoading, hideLoading] = useSpinner();

  const classes = useStyles();
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
    await fetch('http://localhost:8080/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: 'cats', session: storingDataSassion, socket: socketSessionId })
    })
      .then(res => res.json())
      .then((data) => {
        console.log(data);
        if (data.result === "OK") {
        } else {
          alert(data.result);
        }
      })
    showLoading();
    setTimeout(() => {
      hideLoading()
      history.push("/edit")
    }, 2000);
    changeButtonText('Try Again?');
    setvisibleTrain(false)
    console.log('editing images now')
  }

  const goTrain = () => {
    console.log('train me!')
    history.push("/train")
  }

  useEffect(() => {
    if (socket) {
      socket.off('image');
      socket.on('image', (data) => {
        setImages([...searchImages, data]);
        setCount(searchImages.length + 1);
      });
    }
  })

  return (
    <div className='secondScreen'>
      <div></div>
      <div className='leftSection'>
        <h1 className='title result'>2.Results for:<span className='title result-before'>{keyword}</span> </h1>
        <p className='noImages'>no.images found:<span className="number"> {count}</span></p><br />
        <div className='explaining'>
          <p className='explain main'>what you just did was an example for <strong>Data Scraping</strong>.</p>
          <p className='explain two'>Data Scraping is a technique in which a computer program extracts data usually from another program,<br /> <strong>in our case: Google Images</strong>.</p>
          <p className='explain two'> This is a common techniqe when trying to collecting Machine Learning datasets.</p>
          <p className='explain two'>Next step will be cleaning and orginaizing our data</p>
          <button className='more' onClick={() => setKeepGoing(!keepGoing)}>Keep going?</button>
        </div>

        {keepGoing && <div className='editForm'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={classes.root}>
              <Typography className="label" id="track-false-slider" gutterBottom>
                Number of human to extract from background:
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
            <button className='start' name="start" type="submit" ref={register}>{buttonText}</button>
            <button disabled={visibleTrain} className='start train' name="train" onClick={goTrain}>Start Training</button>
          </form>
        </div>}
      </div>

      {loading}
      
      <div className='imageContainer'>
        <div className='images'>
          {searchImages.map(data => (
            <div key={data.url}>
              <img src={data.url} alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}