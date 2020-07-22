import React, {useState, useReducer, useRef, useEffect} from "react"; 

function reducer(currentState, newState) {
  return {...currentState, ...newState}
}

export default function Training() {
  const [{running}, setState] = useReducer(reducer, {
    running: false,
    elapse: 0,
  })
  const [counter, setCounter] = useState(1);
  const intervalRef = useRef(null)
  let imagePng = [];
  

  useEffect(() =>{
  setTimeout(() => {
    if (running ) {
      clearInterval(intervalRef.current)
    } else {
      intervalRef.current = setInterval(() => {
    
      setCounter(counter => counter + 10 )
      }, 1)
    }
    setState({running: !running})
}, 1000)
  },[])

useEffect(() => {
  setState({lapse: 0, running: false})
  return () => clearInterval(intervalRef.current)
}, [])

const sec = Math.floor(counter / 1000);
const min = Math.floor(sec / 60);
const hour = Math.floor(min / 60);
const day = Math.floor(hour / 24); 
 

  return (
    <div style={{textAlign: 'center'}}>
      <label
        style={{
          fontSize: '14px',
          display: 'block',
        }}
      >
        {day % 24} day : {hour % 60} hour: {min % 60} min: {sec % 60} sec : {counter % 1000} ms
      </label>
    
    </div>

  
  )
}


