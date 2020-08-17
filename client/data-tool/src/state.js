import {createStore} from 'redux';

const reducer = (state = {
    socket: null,
    images: [],
    keyword: '',
    image64:[]
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
      keyword: action.keyword
    }
  }
  case 'SAVE_BASE64': {
    return {
      ...state, 
      image64: [...state.image64, action.image64]
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
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), // redux dev tools
);

export default store;
