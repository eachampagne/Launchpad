import axios from "axios";
import { useState, useEffect} from 'react';
import { Button, Switch, For, Text, Box} from "@chakra-ui/react"
import { PinInput } from "@chakra-ui/react"

function Notifications ({ownerId} : {ownerId: number}) {
const [phoneNumber, setPhoneNumber] = useState('');
const [hasNumber, setHasNumber] = useState(false)
const [isAdding, setIsAdding] = useState(false)
const [step, setStep] = useState('phone') // will tell what component to render
const [code, setCode] = useState('')
const [checked, setChecked] = useState(false)
const [verificationStatus, setVerificationStatus] = useState(false)



useEffect(() => {
  const getNumber = async () => {

  try {
    const number = await axios.get(`/notifications/${ownerId}`)
    console.log(number, 'this is number')
    if(!number.data){
      setHasNumber(false)
      setChecked(false)
      setPhoneNumber('')
      return;
      
    }
    setHasNumber(true)
    setPhoneNumber(number.data.data.contact)
    setChecked(number.data.data.noti)
    

  } catch (error) {
    console.error('something went wrong with the number', error)
    setHasNumber(false)
    setChecked(false)
    setPhoneNumber('')
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
    setVerificationStatus(verification.data)
    return {verified : true}
  } catch (error) {
    console.error('something went wrong making the verification', error)
    return {verified : false}
  }
}
// update the number
const updateNumber = async () => {


  try {
    await axios.patch(`/notifications/${ownerId}`, {contactNumber: phoneNumber})


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
    setHasNumber(false)
    setIsAdding(false)
    setPhoneNumber('')
    setChecked(false)
    setStep('phone')
    
  } catch (error) {
    console.error('sorry couldnt delete something thats not there', error)
  }
}

  return (
    <Box>

      {!hasNumber && !isAdding && (
        <Box>
          <Text>Notifications</Text>
          <Button size="sm" variant="surface" colorPalette="blue" onClick={() => setIsAdding(true)}>Add Phone Number</Button>
        </Box>
      )}

      {(isAdding && step === 'phone') && (
        <Box>
          <Text>Enter A Phone Number</Text>
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
          <Button size="sm" variant="surface" colorPalette="blue" onClick={async () => {
            if(!phoneNumber || phoneNumber.length !== 10){
              // if no phone number was added, return them to the place to enter a phone number
              return;
            }

            if(hasNumber){
              await updateNumber()
            } else {
              // add the phone number
              await addNumber();
            }
            await sendVerification();
            setStep('verify')
          }}>Send Verification Code</Button>

        </Box>
      )}
      {step === 'verify' && (
        <Box>
          <Text>Enter Verification Code</Text>
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
          <Button size="sm" variant="surface" colorPalette="blue" onClick={async () => {
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
        </Box>
      )}

      {hasNumber && (
        <Box>
        <Text fontWeight="medium"> Notifications </Text>
        <Switch.Root colorPalette="blue" checked={checked}  onCheckedChange={(e) => updateNotifications(e.checked)}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label />
        </Switch.Root>
        <Text>Phone Number: *** - *** - {phoneNumber.slice(8)}</Text>
        <Button size="sm" variant="surface" colorPalette="blue" onClick={async () => {
          setIsAdding(true)
          setCode('')
          setStep('phone')
        }}>Update Phone Number</Button>
        <Button size="sm" variant="surface" colorPalette="red" onClick={() => deleteNumber()}>Delete Phone Number</Button>
        </Box>
      )}
    </Box>

  )
}


export default Notifications;