import React, { useState, useReducer, useRef, useEffect } from "react";
import FakeImages from '../FakeImagesNames.json';
import singleImg from "../img/fakes006167.png"

function reducer(currentState, newState) {
  return { ...currentState, ...newState }
}

export default function Training() {

  const [{ running }, setState] = useReducer(reducer, {
    running: false,
    elapse: 0,
  })
  const [counter, setCounter] = useState(1);
  const intervalRef = useRef(null);
  const sec = Math.floor(counter / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  useEffect(() => {
    setTimeout(() => {
      if (running) {
        clearInterval(intervalRef.current)
      } else {
        intervalRef.current = setInterval(() => {

          setCounter(counter => counter + 100)
        }, 1)
      }
      setState({ running: !running })
      return () => clearInterval(intervalRef.current)

    }, 1000)
  }, [])

  return (
    <>
    <div className="trainingImages"  style={{backgroundImage: `url(${singleImg})`}}>
      <div className="timer">
       <p className="trainingTitle">Training time:</p> <br/>
       <span className="timeText"> {day % 24} day</span> : 
       <span className="timeText"> {hour % 60} hour</span> : 
       <span className="timeText"> {min % 60} min</span> :
       <span className="timeText"> {sec % 60} sec</span> :
       <span className="timeText ms"> {counter % 1000} ms </span>
      </div>
    </div>
    </>
  )
}


