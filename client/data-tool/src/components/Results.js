import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';
import store from '../state';

export default function Results() {
  const keyword = useSelector(state => state.keyword);
  const socket = useSelector(state => state.socket);
  const corsServer = 'https://clump.systems/'; // avner change this to cors fetch in python! 
  let history = useHistory();

  const searchImages = useSelector(state => state.images64);

  const [count, setCount] = useState()
  const [keepGoing, setKeepGoing] = useState(false);
  const [visiblebtn, setVisiblebtn] = useState(false)


return (
  <div>
    
  </div>
)}