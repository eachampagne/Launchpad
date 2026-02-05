import axios from "axios";
import { useState, useEffect} from 'react';
import { Button, Switch, For } from "@chakra-ui/react"
import { PinInput } from "@chakra-ui/react"

function Notifications ({ownerId} : {ownerId: number}) {
const [phoneNumber, setPhoneNumber] = useState('');
const [hasNumber, setHasNumber] = useState(false)
const [isAdding, setIsAdding] = useState(false)
const [step, setStep] = useState('phone') // will tell what component to render
const [code, setCode] = useState('')
const [checked, setChecked] = useState(false)
const [verificationStatus, setVerificationStatus] = useState(false)
console.log(ownerId, 'here')
console.log(phoneNumber)
// so i need to get the number

useEffect(() => {
  const getNumber = async () => {

  try {
    const number = await axios.get(`/notifications/${ownerId}`)
    console.log(number, 'this is number')
    if(!number.data){
      setHasNumber(false)
      setChecked(false)
      return;
      
    }
    console.log(number, 'this time its number')
    setHasNumber(true)
    setPhoneNumber(number.data.data.contact)
    setChecked(number.data.data.noti)
    

  } catch (error) {
    console.error('something went wrong with the number', error)
    setHasNumber(false)
    setChecked(false)
  }

}
getNumber()
}, [ownerId])


// then allow them to add a number if they dont have one
const addNumber = async () => {
  const contactNumber = '+1' + phoneNumber
  try {
    await axios.post(`/notifications/${ownerId}`, {contactNumber})
  } catch (error) {
    console.error('something went wrong making the post', error)
  }
}

const sendVerification = async () => {
  const contactNumber = phoneNumber
  try {
    const verification = await axios.post(`/notifications/verify/send/${ownerId}`, {contactNumber})
    setVerificationStatus(verification.data)
  } catch (error) {
    console.error('something went wrong making the post', error)
  }
}

// send the verification for checking
const checkVerification = async () => {
  try {
    const verification = await axios.post(`/notifications/verify/check/${ownerId}`, {code})
    console.log(verification, 'coming from inside checkVerification')
    setVerificationStatus(verification.data)
    return {verified : true}
  } catch (error) {
    console.error('something went wrong making the verification', error)
    return {verified : false}
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

// change the notifications only
const updateNotifications = async (checked: boolean) => {
  setChecked(checked)
  try {
    await axios.patch(`/notifications/notifications/${ownerId}`, {notifications: checked})

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

      {!hasNumber && !isAdding && (
        <div>
          <p>Notifications</p>
          <button onClick={() => setIsAdding(true)}>Add Phone Number</button>
        </div>
      )}

      {!hasNumber && isAdding && step === 'phone' && (
        <div>
          <p>Enter A Phone Number</p>
          <For each={['sm']}>
            {(size) => (
            <PinInput.Root key={size} size={size} onValueChange={(e) => setPhoneNumber(e.valueAsString)}>
              <PinInput.HiddenInput />
              <PinInput.Control>
                <PinInput.Input index={0} />
                <PinInput.Input index={1} />
                <PinInput.Input index={2} />
                <PinInput.Input index={3} />
                <PinInput.Input index={4} />
                <PinInput.Input index={5} />
                <PinInput.Input index={6} />
                <PinInput.Input index={7} />
                <PinInput.Input index={8} />
                <PinInput.Input index={9} />
              </PinInput.Control>
            </PinInput.Root>
            )}
          </For>
          <Button onClick={async () => {
            if(!phoneNumber || phoneNumber.length !== 10){
              // if no phone number was added, return them to the place to enter a phone number
              return;
            }
            // add the phone number
            await addNumber();
            await sendVerification();
            setStep('verify')
          }}>Send Verification Code</Button>

        </div>
      )}
      {step === 'verify' && (
        <div>
          <p>Enter Verification Code</p>
          <For each={['sm']}>
            {(size) => (
            <PinInput.Root key={size} size={size} onValueChange={(e) => setCode(e.valueAsString)}>
              <PinInput.HiddenInput />
              <PinInput.Control>
                <PinInput.Input index={0} />
                <PinInput.Input index={1} />
                <PinInput.Input index={2} />
                <PinInput.Input index={3} />
                <PinInput.Input index={4} />
                <PinInput.Input index={5} />
              </PinInput.Control>
            </PinInput.Root>
            )}
          </For>
          <Button onClick={async () => {
            const verified = await checkVerification()
            console.log(verified, 'this is verified on click')
            if(verified?.verified === true){
              // may or may not need this
              setHasNumber(true)
              setIsAdding(false)
              // step it back to the phone part
              setStep('phone')
              setCode('')
            } else {
              // code do a pop out error, or make it read border flash
              console.log('Wrong Code')
            }
          }}>Verify Code</Button>
        </div>
      )}

      {hasNumber && (
        <div>
        <p> Notifications </p>
        <Switch.Root checked={checked}  onCheckedChange={(e) => updateNotifications(e.checked)}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label />
        </Switch.Root>
        <p>Phone Number: *** - *** - {phoneNumber.slice(8)}</p>

        <button onClick={() => deleteNumber()}>Delete Phone Number</button>
        </div>
      )}
      {/* <p>{phoneNumber}</p>
      <input type='tel' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      <button onClick={() => {
        if(phoneNumber.length > 0){
         addNumber()
        }
        
      }}>Save Phone Number</button>
      <p>Update Phone Number</p>
      <input type='tel' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
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
      <button onClick={() => deleteNumber()}>Delete Phone Number</button> */}
      
      
    </div>

  )
}


export default Notifications;