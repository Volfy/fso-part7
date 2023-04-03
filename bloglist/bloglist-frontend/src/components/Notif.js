import { useNotifObject } from '../NotifContext'

const Notif = () => {
  const { msg: message, err: isError } = useNotifObject()
  
  // TAKEN FROM BOOTSTRAP!
  const notifStyle = {
    padding: 15,
    marginBottom: 20,
    border: '1px solid transparent',
    borderRadius: 4,
    color: '#3c763d',
    backgroundColor: '#dff0d8',
    borderColor: '#d6e9c6',
    ...(isError && {
      color: '#a94442',
      backgroundColor: '#f2dede',
      borderColor: '#ebccd1',
    }),
  }

  return (
    message && (
      <div style={notifStyle} id="notif">
        {message}
      </div>
    )
  )
}

export default Notif
