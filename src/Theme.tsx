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
import { Box, Button, Text } from "@chakra-ui/react"
import { Listbox, createListCollection } from "@chakra-ui/react"



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
  console.log(currTheme, 'CURRENTTT')
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
      setter(e.value.toString('hex'))
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
    return await axios.patch(`/dashboard/${dashboardId}`, data)
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
      const {themeId} = data
      await axios.delete(`/theme/delete/${ownerId}`, {data: {themeId}})
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



  return (
    <Box>
    {
      <Listbox.Root collection={allThemesList} width="320px">
      <Listbox.Label fontSize='md' fontWeight='bold'>Select Theme</Listbox.Label>
      <Listbox.Content  maxH='200px' overflowY='auto' w='130%'>
        {allThemesList.items.map((theme) => (
          <Box border='1px solid' borderRadius='md' borderColor='grey'>
          <Listbox.Item item={theme} key={theme.id} onClick={() => {
            setCurrTheme(theme)
            setNavColorPick(theme.navColor)
            setBgColorPick(theme.bgColor)
            setFontPick(theme.font)
            updateTheme({themeId: theme.id})
          }}>
            <Listbox.ItemText> navColor: <ColorSwatch value={theme.navColor}/> bgColor: <ColorSwatch value={theme.bgColor}/> font: <ColorSwatch value={theme.font}/></Listbox.ItemText>
            <Listbox.ItemIndicator />
          <Button size='2xs' variant='surface' colorPalette='red' onClick={() => {
            deleteTheme({themeId: theme.id})
            }}> Delete </Button>
          </Listbox.Item>
          </Box>
        ))}
      </Listbox.Content>
    </Listbox.Root>
    }
    <Text fontSize='md' fontWeight='bold' >Create A Theme</Text>
    <Box maxW='320px' border='1px solid' borderColor='gray' borderRadius='md' p='4'>
      <form>
        <label>navColor</label>
        <Box id='navColor'>
          <Color onValueChange={colorPicker(setNavColorPick)}  />
        </Box>
        <label>bgColor</label>
        <Box id='bgColor'>
          <Color onValueChange={colorPicker(setBgColorPick)}/>
        </Box>
        <label>font</label>
        <Box id='font'>
          <Color onValueChange={colorPicker(setFontPick)}/>
        </Box>
      </form>
      <Button size='2xs' variant='surface' colorPalette='blue' onClick={createTheme}>CREATE</Button>
      <Button size='2xs' variant='ghost' colorPalette='blue' onClick={() => {
        if(currTheme.id !== -1){
          updateTheme({
            themeId: currTheme.id,
            navColor: navColorPick,
            bgColor: bgColorPick,
            font: fontPick

          })
        } else {
          console.error('Select a theme')
        }
      }}></Button>
      </Box>
    </Box>
  )
}

export default Theme;