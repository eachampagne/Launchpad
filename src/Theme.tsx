
import { useState, useEffect, useContext} from 'react';
import { parseColor } from "@chakra-ui/react"
import Color from './ColorPicker';
import axios from 'axios';
import { Box, Button, Text, Listbox, createListCollection } from "@chakra-ui/react"
import { IoTrashSharp, IoPencilSharp, IoAddCircleOutline } from "react-icons/io5";
import { UserContext } from './UserContext';


function Theme ({dashboard, ownerId, dashboardId}: {dashboard: { name: string, ownerId: number}, ownerId: number, dashboardId : number}) {
  const [themesList, setThemesList] = useState([] as {id: number, navColor: string, bgColor: string, font: string}[]);

  // const [form, setForm] = useState({navColor: 'white', bgColor: 'white', font: 'ariel'});
  const [color, setColor] = useState('test')
  const [navColorPick, setNavColorPick] = useState('#ff0000');
  const [bgColorPick, setBgColorPick] = useState('#ff0000');
  const [fontPick, setFontPick] = useState('#ff0000');
  const [activeDash, setActiveDash] = useState({id: -1, navColor: 'string', bgColor: 'string', font: 'string'});
  const [currTheme, setCurrTheme] = useState(activeDash);
  const { setCurrentTheme } = useContext(UserContext);

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
    navColor: 'Nav',
    bgColor: 'Bg',
    font: 'Widget'
  }

  return (
    <Box>
    {
      <Listbox.Root collection={allThemesList} width="320px">
      <Listbox.Label fontSize='md' fontWeight='bold'>Select Theme</Listbox.Label>
      <Listbox.Content  maxH='300px' overflowY='auto' w='full' flexWrap='wrap'>
        {allThemesList.items.map((theme) => (
          <Box border={currTheme.id === theme.id ? `1.5px solid ${theme.font}b3` : '1.5px solid rgba(255,255,255,0.07)'}
          key={theme.id} borderRadius='14px' p='4' mb='3' w='full' cursor='pointer'
          bg={currTheme.id === theme.id ? 'rgba(225, 225, 225, 0.05)' : 'rgba(255,255,255,0.02)'}
          backdropFilter='blur(8px)' boxShadow={currTheme.id === theme.id ? `0 0 24px ${theme.font}33, inset 0 1px 0 rgba(255,255,255,0.06)` : 'inset 0 1px 0 rgba(255,255,255,0.04)'}
          transition='all 0.2s ease' position='relative' _hover={{ bg: 'rgba(255,255,255,0.05)', border: `1.5px solid ${theme.font}80`, boxShadow: `-4px 4px 20px ${theme.navColor}66, 0 0 20px ${theme.bgColor}44, 4px 4px 20px ${theme.font}66, inset 0 1px 0 rgba(255,255,255,0.06)` }}
          className={currTheme.id === theme.id ? 'selected' : ''}
          css={{
            '&:hover .color, &.selected .color': { boxShadow: `-12px 0 24px ${theme.navColor}, 0 0 24px ${theme.bgColor}, 12px 0 24px ${theme.font}`},
                '&:hover .navColor, &.selected .navColor': { filter: `drop-shadow(0 0 12px ${theme.navColor})` },
                '&:hover .bgColor, &.selected .bgColor': { filter: `drop-shadow(0 0 12px ${theme.bgColor})` },
                '&:hover .widget, &.selected .widget': { filter: `drop-shadow(0 0 12px ${theme.font})` },
              }}
          >
          <Listbox.Item item={theme} onClick={async () => {
            setCurrTheme(theme)
            setNavColorPick(theme.navColor)
            setBgColorPick(theme.bgColor)
            setFontPick(theme.font)
            setCurrentTheme(theme)
            await axios.patch(`/dashboard/${dashboardId}`, { themeId: theme.id })
            await getTheDash();
          }}>
            <Listbox.ItemText w='full'>
            <Box w='full'>
            <Box mb='4' borderRadius='8px' overflow='visible' className='color' css={{ boxShadow: 'none', transition: 'box-shadow 0.3s ease' }}>
            <Box display='flex' h='48px' borderRadius='8px' overflow='hidden' border='none'>
                <Box flex='1' bg={theme.navColor} className='navColor' css={{ filter: 'none', transition: 'filter 0.3s ease' }}/>
                <Box flex='1' bg={theme.bgColor} className='bgColor' css={{ filter: 'none', transition: 'filter 0.3s ease' }}/>
                <Box flex='1' bg={theme.font} className='widget' css={{ filter: 'none', transition: 'filter 0.3s ease' }}/>
              </Box>
            </Box>

              <Box display='flex' w='full' justifyContent='space-between' >
                {colors.map((key) => (
                  <Box key={key} display='flex' flexDirection='column' alignItems='center' gap='1'>
                  <Box w='32px' h='32px' borderRadius='8px' bg={theme[key]} border='1px solid rgba(255,255,255,0.12)' boxShadow={`0 0 12px 2px ${theme[key]}cc`} transition='box-shadow 0.3s ease'>
                  </Box>
                  <Text fontSize='15px' color='#64748b' fontWeight='medium' mb='1'>{colorMap[key]}</Text>
                  {/* <Text fontSize='10px' color='white'>{theme[key]}</Text> */}
                  </Box>
                ))}
              </Box>
            </Box>
            </Listbox.ItemText>
            <Listbox.ItemIndicator />
            </Listbox.Item>
            
          <Button size='2xs' variant='ghost' colorPalette='red' onPointerDown={(e) => {
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
    <Box maxW='320px' border='1px solid' borderColor='gray' borderRadius='md' p='4' bg='rgba(255,255,255,0.02)' backdropFilter='blur(8px)'>
      <Box display='flex' flexDirection='column' gap='3'>
        {[
          { label: 'Navigation', value: navColorPick, color: setNavColorPick },
          { label: 'Background', value: bgColorPick, color: setBgColorPick },
          { label: 'Widget', value: fontPick, color: setFontPick },
        ].map(({ label, value, color }) => (
          <Box key={label} display='flex' alignItems='center' justifyContent='space-between'>
            <Text fontSize='13px' fontWeight='500' color='#94a3b8'>{label} </Text>
            <Box display='flex' alignItems='center' gap='2'>
              <Box w='22px' h='22px' borderRadius='6px' bg={value} border='1px solid rgba(255,255,255,0.15)' flexShrink={0} />
              <Color value={value} onValueChange={colorPicker(color)} />
            </Box>
          </Box>
        ))}
      </Box>
      <Box display='flex' gap='3' mt='3'>
      <Button flex='1' variant='outline' borderColor='rgba(255,255,255,0.1)' color='#94a3b8' borderRadius='10px' onClick={createTheme}>{<IoAddCircleOutline />}Create</Button>
      <Button flex='1' borderRadius='10px' background='linear-gradient(135deg, #6366f1, #8b5cf6)' color='white' border='none' boxShadow='0 4px 16px rgba(99,102,241,0.3)' _hover={{ opacity: 0.85 }} onClick={() => {
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
      }}>{<IoPencilSharp/>}Update</Button>
      </Box>
      </Box>
      
    </Box>

  )
}

export default Theme;