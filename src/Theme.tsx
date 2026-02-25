// needs something in dash editor to open this component
// could add dashboard name change here if needed
/**
 * need bgColor POST and PATCH
 * need navColor POST and PATCH
 * need text color POST and PATCH - idk if i need this or not
 * need font POST and PATCH
 * display all themes the user has - GET
 * might also add a default palette if user has no them
 */


import { useState, useEffect, use} from 'react';
import Color from './ColorPicker';
import axios from 'axios';
import { ColorSwatch } from "@chakra-ui/react"
import { Box, Button, Text, Group } from "@chakra-ui/react"
import { Listbox, createListCollection } from "@chakra-ui/react"
import { IoCall, IoTrashSharp, IoPencilSharp, IoAddCircleOutline } from "react-icons/io5";



function Theme ({dashboard, ownerId, dashboardId}: {dashboard: { name: string, ownerId: number}, ownerId: number, dashboardId : number}) {
  const [themesList, setThemesList] = useState([] as {id: number, navColor: string, bgColor: string, font: string}[]);

  // const [form, setForm] = useState({navColor: 'white', bgColor: 'white', font: 'ariel'});
  const [color, setColor] = useState('test')
  const [navColorPick, setNavColorPick] = useState('#ff0000');
  const [bgColorPick, setBgColorPick] = useState('#ff0000');
  const [fontPick, setFontPick] = useState('#ff0000');
  const [activeDash, setActiveDash] = useState({id: -1, navColor: 'string', bgColor: 'string', font: 'string'});
  const [currTheme, setCurrTheme] = useState(activeDash);
  // first lets get all the themes of that user
  console.log(themesList, 'ALL MY THEMESES')
  const allThemes = async () => {

    try {
      const test = await axios.get(`/theme/${ownerId}`);
      setThemesList(test.data);

    } catch (error) {
      console.error('Failed to get all of your themes', error);
    }
  }

  const colorPicker = (setter: (value: string) => void) => {
    return (e: any) => {
      const newColor = e.valueAsString || e.value
      if(newColor){
        setter(String(newColor))
      }
    }
  }

  const createTheme = async () => {
    try {
      await axios.post('/theme', {
        public: false,
        navColor: navColorPick,
        bgColor: bgColorPick,
        font: fontPick,
        ownerId: ownerId
      })
      allThemes();
    } catch (error) {
      console.error(error, 'something went wrong')
    }
  }

  const getTheDash = async () => {
      try {
        const dashes = await axios.get(`dashboard/all/${ownerId}`)
        const dashboards = dashes.data;
        dashboards.forEach((dash: any) => {
          if(dash.id === dashboardId){
            setActiveDash(dash)
            
          }
        })

      } catch (error) {
        console.error(error, 'something went wrong is getTheDash')
      }
  }

//  for patch - update the theme on the current dashboard
  const updateTheme = async (data: any) => {
    try {
    await axios.patch(`/theme`, {...data, ownerId: ownerId})
    await allThemes()
    await getTheDash()
    }catch (error) {
        console.error(error, 'something went wrong is getTheDash')
      }
  }

  // for the list box
  const allThemesList = createListCollection({
    items: themesList,
    itemToString: (item) => item.navColor,
    itemToValue: (item) => item.id.toString()
  })

 // deleting the theme
  const deleteTheme = async (data: any) => {
    try {
      const { themeId } = data
      await axios.delete(`/theme/delete/${ownerId}`, {data: { themeId }})
      allThemes()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    // if the owner is provided
    if(dashboard.ownerId){
      allThemes();
      getTheDash();
    }
  }, [dashboard.ownerId])

  const colors = ['navColor', 'bgColor', 'font'] as const;
  // renaming the color holders
  const colorMap = {
    navColor: 'Navigation',
    bgColor: 'Background',
    font: 'Widget'
  }

  return (
    <Box>
    {
      <Listbox.Root collection={allThemesList} width="320px">
      <Listbox.Label fontSize='md' fontWeight='bold'>Select Theme</Listbox.Label>
      <Listbox.Content  maxH='300px' overflowY='auto' w='full' flexWrap='wrap'>
        {allThemesList.items.map((theme) => (
          <Box border='1px solid' key={theme.id} borderRadius='sm' borderColor='grey' p='4' mb='3' flex='0 0 180px'>
          <Listbox.Item item={theme} onClick={async () => {
            setCurrTheme(theme)
            setNavColorPick(theme.navColor)
            setBgColorPick(theme.bgColor)
            setFontPick(theme.font)
            await axios.patch(`/dashboard/${dashboardId}`, { themeId: theme.id })
            await getTheDash();
          }}>
            <Listbox.ItemText w='full'>
            <Box w='full'>
              <Box display='flex' h='60px' w='250px' mb='5' borderRadius='sm' overflow='hidden'>
              <Box flex='1' bg={theme.navColor} />
              <Box flex='1' bg={theme.bgColor} />
              <Box flex='1' bg={theme.font} />
              </Box>

              <Box display='flex' w='full' justifyContent='space-between' gap='1'>
                {colors.map((key) => (
                  <Box key={key} flex='1' textAlign='center'>
                  <Box textAlign='center'>
                  <Text fontSize='xs' color='white' fontWeight='medium' mb='1'>{colorMap[key]}</Text>
                  </Box>
                  {/* <Text fontSize='10px' color='white'>{theme[key]}</Text> */}
                  </Box>
                ))}
              </Box>
            </Box>
            </Listbox.ItemText>
            <Listbox.ItemIndicator />
            </Listbox.Item>
            
          <Button size='2xs' variant='ghost' colorPalette='red' onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            deleteTheme({themeId: theme.id})
            }}>{<IoTrashSharp />}</Button>
          
          </Box>
        ))}
      </Listbox.Content>
    </Listbox.Root>
    }
    <Text fontSize='md' fontWeight='bold' >Create A Theme</Text>
    <Box maxW='320px' border='1px solid' borderColor='gray' borderRadius='md' p='4'>
      <form>
        <label>Navigation</label>
        <Box id='navColor'>
          <Color value={navColorPick} onValueChange={colorPicker(setNavColorPick)}  />
        </Box>
        <label>Background</label>
        <Box id='bgColor'>
          <Color value={bgColorPick} onValueChange={colorPicker(setBgColorPick)}/>
        </Box>
        <label>Widget</label>
        <Box id='font'>
          <Color value={fontPick} onValueChange={colorPicker(setFontPick)}/>
        </Box>
      </form>
      <Button size='md' variant='ghost' colorPalette='blue' onClick={createTheme}>{<IoAddCircleOutline />}</Button>
      <Button size='md' variant='ghost' colorPalette='blue' onClick={() => {
        const updateThemeId = currTheme.id !== -1 ? currTheme.id : activeDash.id
        if(updateThemeId !== -1){
          updateTheme({
            id: updateThemeId,
            navColor: navColorPick,
            bgColor: bgColorPick,
            font: fontPick

          })
        } else {
          console.error('Select a theme')
        }
      }}>{<IoPencilSharp/>}</Button>
      </Box>
    </Box>
  )
}

export default Theme;