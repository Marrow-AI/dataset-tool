import {createStore, compose, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const reducer = (state = {
    socket: null,
    images: [],
    imageUrls: [],
    keyword: [],
    cropImages: [],
    numberPeople: 0,
    numberVersions: 0,
}, action) => {
  switch (action.type) {

    case 'SET_SOCKET': {
        console.log("Setting socket", action.socket);
        return {...state, socket: action.socket}
    }
	case 'SET_SESSION': {
		console.log("Setting session", action.session);
		return {...state, session: action.session}
  }
  case 'SOCKET_EVENT': {
    if (action.eventName === 'image') {
      console.log('adding a new image" ', action.data.url)
      return {
        ...state,
        images: [...state.images, action.data]
      }
    }
  }
  case 'SAVE_KEYWORD': {
    return {
      ...state,
      keyword: [...state.keyword, action.keyword, '+']
    }
  }
  case 'SAVE_IMAGE_URL': {
    return {
      ...state, 
      imageUrls: [...state.imageUrls, action.imageUrl]
    }
  }
  case 'CROP_IMAGE': {
    return {
      ...state,
      cropImages: [...state.cropImages, action.cropImages]
    }
  }
  case 'SAVE_VALUE_SLIDER': {
    return {
      ...state,
      numberPeople: action.numberPeople,
      numberVersions: action.numberVersions
    }
  }
    default:
      return state;
  }
}


export const setSocket = (socket) => ({
    type: 'SET_SOCKET',
    socket
})
export const setSession = (session) => ({
	type: 'SET_SESSION',
	session
})

const store = createStore(
  reducer,
  composeEnhancer(applyMiddleware(thunk)),
);

export default store;
