import axios from "axios";
import { useState, useEffect} from 'react';
import { Switch } from "@chakra-ui/react"

function Notifications ({ownerId} : {ownerId: number}) {
const [phoneNumber, setPhoneNumber] = useState('');
const [checked, setChecked] = useState(false)
console.log(ownerId, 'here')
console.log(phoneNumber)
// so i need to get the number

useEffect(() => {
  const getNumber = async () => {
  
  try {
    const number = await axios.get(`/notifications/${ownerId}`)

    if(number === undefined){
      return (
        <p> you have no phone number</p>
      )
    } else {
      setPhoneNumber(number.data.contactNumber)
      console.log(number)
    }
  } catch (error) {
    console.error('something went wrong with the number', error)
  }

}
getNumber()
}, [ownerId])


// then allow them to add a number if they dont have one
const addNumber = async () => {
  const contactNumber = phoneNumber
  try {
    await axios.post(`/notifications/${ownerId}`, {contactNumber})
  } catch (error) {
    console.error('something went wrong making the post', error)
  }
}


// update the number
const updateNumber = async (notifications?: any) => {

  setChecked(notifications)
  try {
    await axios.patch(`/notifications/${ownerId}`, {contactNumber: phoneNumber, notifications: notifications})
    setChecked(!notifications)

    console.log('success')
  } catch (error) {
    console.error('something went wrong updated the phone number', error)
  }
}


// delete button for the number
const deleteNumber = async () => {
  try {
    axios.delete(`/notifications/${ownerId}`)
  } catch (error) {
    console.error('sorry couldnt delete something thats not there', error)
  }
}

  return (
    <div>
      <p>{phoneNumber}</p>
      <input type='text' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      <button onClick={() => {
        if(phoneNumber.length > 0){
         addNumber()
        }
        
      }}>Save Phone Number</button>
      <p>Update Phone Number</p>
      <input type='text' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      <button onClick={() => {
        if(phoneNumber.length > 0){
         updateNumber()
        }
      }}>Save Phone Number</button>
      <p> Notifications </p>
        <Switch.Root checked={checked} onCheckedChange={updateNumber}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label />
        </Switch.Root>
      <button onClick={() => deleteNumber()}>Delete Phone Number</button>
    </div>

  )
}

export default Notifications;