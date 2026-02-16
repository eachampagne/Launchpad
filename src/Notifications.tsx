import axios from "axios";
import { useState, useEffect} from 'react';
import { Button, Switch, For, Text, Box, Flex, Spacer, Center} from "@chakra-ui/react"
import { PinInput } from "@chakra-ui/react"
import { IoCall, IoTrashSharp, IoPencilSharp } from "react-icons/io5";



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
    if(!verificationStatus){

      setVerificationStatus(Boolean(number.data.data.verified))
    }

  } catch (error) {
    console.error('something went wrong with the number', error)
    setHasNumber(false)
    setChecked(false)
    setPhoneNumber('')
    setVerificationStatus(false)
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
    await axios.post(`/notifications/verify/send/${ownerId}`, {contactNumber})
    //setVerificationStatus(verification.data)
  } catch (error) {
    console.error('something went wrong making the post', error)
  }
}

// send the verification for checking
const checkVerification = async () => {
  try {
    const {data} = await axios.post(`/notifications/verify/check/${ownerId}`, {code})
    setIsAdding(false)
    setVerificationStatus(Boolean(data.verified))
    return {verified : Boolean(data.verified)}
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
    await axios.delete(`/notifications/${ownerId}`)
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
    <Box  w='100%'>

      {!hasNumber && !isAdding && (
        <Center>
          <Button placeContent='center' size='xs' variant='ghost' colorPalette='blue' onClick={() => setIsAdding(true)}>{<IoCall />} Add Phone Number</Button>
        </Center>
      )}

      {(isAdding && step === 'phone') && (
        <Box>
          <Center>
          <Text fontWeight='medium'>Enter A Phone Number</Text>
          </Center>
          <For each={['2xs']}>
            {(size) => (
            <PinInput.Root key={size} size={size} onValueChange={(e) => setPhoneNumber(e.valueAsString)}>
              <PinInput.HiddenInput />
              <PinInput.Control >
                <Box gap='1' >
                <PinInput.Input index={0} placeholder='X' />
                <PinInput.Input index={1} placeholder='X' />
                <PinInput.Input index={2} placeholder='X' />
                </Box>
                <span>-</span>
                <Box gap='1'>
                <PinInput.Input index={3} placeholder='X' />
                <PinInput.Input index={4} placeholder='X' />
                <PinInput.Input index={5} placeholder='X' />
                </Box>
                <span>-</span>
                <Box gap='1'>
                <PinInput.Input index={6} placeholder='X' />
                <PinInput.Input index={7} placeholder='X' />
                <PinInput.Input index={8} placeholder='X' />
                <PinInput.Input index={9} placeholder='X' />
                </Box>
              </PinInput.Control>
            </PinInput.Root>
            )}
          </For>
          <Center mt='1'>
          <Button  placeContent='center' size="xs" variant="surface" colorPalette="blue" onClick={async () => {
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
          }}>Send Code</Button>
          </Center>

        </Box>
      )}


      
      {step === 'verify' && (
        <Box>
          <Center>
          <Text fontWeight="medium" >Enter Verification Code</Text>
          </Center>
          <Center>
          <For each={['sm']}>
            {(size) => (
            <PinInput.Root key={size} size={size} onValueChange={(e) => setCode(e.valueAsString)}>
              <PinInput.HiddenInput />
              <PinInput.Control>
                <PinInput.Input index={0} placeholder='X'/>
                <PinInput.Input index={1} placeholder='X'/>
                <PinInput.Input index={2} placeholder='X'/>
                <PinInput.Input index={3} placeholder='X'/>
                <PinInput.Input index={4} placeholder='X'/>
                <PinInput.Input index={5} placeholder='X'/>
              </PinInput.Control>
            </PinInput.Root>
            )}
          </For>
          </Center>
          <Center mt='1'>
          <Button placeContent='center' size="xs" variant="surface" colorPalette="blue" onClick={async () => {
            const verified = await checkVerification()
            console.log(verified, 'this is verified on click')
            if(verified.verified){
              // may or may not need this
              setHasNumber(true)
              setIsAdding(false)
              // step it back to the phone part
              setVerificationStatus(true)
              setStep('phone')
              setCode('')
            } else {
              // code do a pop out error, or make it read border flash
              console.log('Wrong Code')
            }
          }}>Verify</Button>
          </Center>
        </Box>
      )}


      {hasNumber && !isAdding && !verificationStatus && step !== 'verify' && (
        // so if the user clicks off the verification code step
        // they will have a number but they cannot enable notifications until they verify the number
        <Box  w='100%'>
        <Flex justify='space-between' align='center' mb='3' w='100%'>
          
        <Text fontWeight="medium"> Notifications </Text>
        <Spacer />
        <Switch.Root disabled colorPalette="blue" checked={checked}  onCheckedChange={(e) => updateNotifications(e.checked)}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label />
        </Switch.Root>
        </Flex>
        <Text fontWeight="medium" mb='4' >Phone Number: XXX - XXX - {phoneNumber.slice(8)}</Text>
        <Flex justify='space-between' align='center' mb='3'>
        <Button size="xs" variant="ghost" colorPalette="blue" onClick={async () => {
          setIsAdding(true)
          setCode('')
          setStep('phone')
        }}>Update Phone Number</Button>
        <Button onClick={async () => {
          setStep('verify')
          await sendVerification()
          
        }}>Verify Number</Button>
        
        <Button size="xs" variant="ghost" colorPalette="red" placeContent='center' onClick={() => deleteNumber()}>{<IoTrashSharp/>}</Button>
        </Flex>
        </Box>
      )}




      {hasNumber && verificationStatus && !isAdding && step == 'phone' && (
        <Box  w='100%'>
        <Flex justify='space-between' align='center' mb='3' w='100%'>
          
        <Text fontWeight="medium"> Notifications </Text>
        <Spacer />
        <Switch.Root colorPalette="blue" checked={checked}  onCheckedChange={(e) => updateNotifications(e.checked)}>
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label />
        </Switch.Root>
        </Flex>
        <Flex justify='space-between' align='center' mb='3'>
        <Text fontWeight="medium" mb='4' >Phone Number: XXX - XXX - {phoneNumber.slice(8)}</Text>
      
        <Button size="xs" variant="ghost" colorPalette="blue" onClick={async () => {
          setIsAdding(true)
          setCode('')
          setStep('phone')
        }}>{<IoPencilSharp />}</Button>
        </Flex>
        <Button size="xs" variant="ghost" colorPalette="red" placeContent='center' onClick={() => deleteNumber()}>{<IoTrashSharp/>}</Button>
        </Box>
      )}
    </Box>

  )
}


export default Notifications;