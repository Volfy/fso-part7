import { createContext, useReducer, useContext } from 'react'

const notifReducer = (state, action) => {
  switch (action.type) {
  case 'SET_GOOD':
    return {
      msg: action.payload,
      err: false,
    }
  case 'SET_ERR':
    return {
      msg: action.payload,
      err: true,
    }
  case 'CLEAR':
    return {
      msg: '',
      err: false,
    }
  default:
    return state
  }
}

const NotifContext = createContext()
export const NotifContextProvider = (props) => {
  const [notif, notifDispatch] = useReducer(notifReducer, {})

  return (
    <NotifContext.Provider value={[notif, notifDispatch]}>
      {props.children}
    </NotifContext.Provider>
  )
}

export const useNotifObject = () => {
  const [notif] = useContext(NotifContext)
  return notif
}

export const useNotify = () => {
  const context = useContext(NotifContext)
  const dispatch = context[1]
  return (payload, isError) => {
    dispatch({ type: isError ? 'SET_ERR' : 'SET_GOOD', payload })
    setTimeout(() => {
      dispatch({ type: 'CLEAR' })
    }, 5000)
  }
}

export default NotifContext
