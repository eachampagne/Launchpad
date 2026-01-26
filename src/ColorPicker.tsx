import { ColorPicker } from "@chakra-ui/react"
// import { useState } from "react"

function Color ({onValueChange}: {onValueChange: (e: any) => void}) {
  //console.log(onValueChange, 'hey there')
  // const [color, setColor] = useState('#ffffff')
  // console.log(color)
  //const picker = useColorPicker();
  // onValueChange={(e) => setColor(e.value.toString('hex'))} color={color}
  return (
    <ColorPicker.Root onValueChange={onValueChange}>
  <ColorPicker.HiddenInput />
  <ColorPicker.Label />
  <ColorPicker.Control>
    <ColorPicker.Input />
    <ColorPicker.Trigger />
  </ColorPicker.Control>
  <ColorPicker.Positioner>
    <ColorPicker.Content>
      <ColorPicker.Area />
      <ColorPicker.EyeDropper />
      <ColorPicker.Sliders />
      <ColorPicker.SwatchGroup>
      </ColorPicker.SwatchGroup>
    </ColorPicker.Content>
  </ColorPicker.Positioner>
</ColorPicker.Root>
  )
}

export default Color