import { useState, useEffect, useContext} from 'react';
import { parseColor } from '@chakra-ui/react'
import Color from './ColorPicker';
import axios from 'axios';
import { Box, Button, Text, Listbox, createListCollection } from "@chakra-ui/react"
import { IoTrashSharp, IoPencilSharp, IoAddCircleOutline, IoPeopleSharp, IoPeopleOutline } from "react-icons/io5";
import { UserContext } from './UserContext';


function Theme ({dashboard, ownerId, dashboardId}: {dashboard: { name: string, ownerId: number}, ownerId: number, dashboardId : number}) {
  const [themesList, setThemesList] = useState([] as {id: number, navColor: string, bgColor: string, font: string, name: string, public: boolean}[]);

  // const [form, setForm] = useState({navColor: 'white', bgColor: 'white', font: 'ariel'});
  const [color, setColor] = useState('test')
  const [navColorPick, setNavColorPick] = useState('#ff0000');
  const [bgColorPick, setBgColorPick] = useState('#ff0000');
  const [fontPick, setFontPick] = useState('#ff0000');
  const [activeDash, setActiveDash] = useState({id: -1, navColor: 'string', bgColor: 'string', font: 'string', name: 'string', public: false});
  const [currTheme, setCurrTheme] = useState(activeDash);
  const [publicStatus, setPublicStatus] = useState(currTheme.public);
  const [editingTheme, setEditingTheme] = useState(false)
  const [page, setPage] = useState(0);
  const { setCurrentTheme } = useContext(UserContext);

  const allThemes = async () => {
    try {
      const test = await axios.get(`/theme/owner/${ownerId}`);
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
    await axios.patch(`/theme/`, {...data, ownerId: ownerId})
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
  const deleteTheme = async (data: {themeId: number}) => {
    try {
      const { themeId } = data
      await axios.delete(`/theme/delete/${ownerId}`, {data: { themeId }})
      await allThemes();
    } catch (error) {
      console.error(error);
    }
  }


  // display all the public themes to the user to save to their own collection
  const allPublicThemes = async () => {
    try {
      const publicThemes = await axios.get('/publicThemes')
      console.log(publicThemes)
    } catch (error) {
      console.error(error);
    }
  }

  // make the theme public
  const makePublicTheme = async (currTheme: {id: number, public: boolean}) => {
    try {
      const makePublic = await axios.patch(`/theme/${currTheme.id}`)
      const updatedTheme = makePublic.data.theme


      if(updatedTheme.public === true){
        await axios.post(`/publicThemes`, {themeId: currTheme.id, ownerId})
      } else {
        await axios.delete(`/publicThemes/${currTheme.id}`)
      }
      setPublicStatus(updatedTheme.public)
      await allThemes()
      console.log(currTheme)
    } catch (error) {
      console.error(error)
    }
  }

  // save a copy of the theme
  const savePublicTheme = async () => {
    try {

      await axios.post(`/publicThemes/${currTheme.id}/${ownerId}`)

    } catch (error) {
      console.error(error)
    }
  }

  // added a userEffect so that when the user opens the editor the current theme is shown active
  useEffect(() => {
    // if the themesList has content and the dash isnt a demo find and set the current theme
    if(themesList.length > 0 && activeDash.id !== -1){
      const existing = themesList.find(theme => theme.id === (activeDash as any).themeId)
      // if it does exist then it needs to me the current theme
      if(existing) {
        setCurrTheme(existing)
      }
    }
  }, [activeDash.id, themesList.length])


  useEffect(() => {
    // if the owner is provided
    if(dashboard.ownerId){
      allThemes();
      getTheDash();
      allPublicThemes();
    }
  }, [dashboard.ownerId])

  const colors = ['Nav', 'Bg', 'Widget'] as const;
  // renaming the color holders
  const colorMap = {
    navColor: 'Nav',
    bgColor: 'Bg',
    font: 'Widget'
  }

  return (
    <Box>
    {/* {
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
                  {/* </Box>
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
          <Button size='2xs' variant='ghost' colorPalette='red' onPointerDown={makePublicTheme}>Make them public</Button>
          <Button size='2xs' variant='ghost' colorPalette='red' onPointerDown={savePublicTheme}>Save this theme</Button>
        </Box>
          ))}
      </Listbox.Content>
      </Listbox.Root>
    } */}

    {/* Changing the display of the cards and only allow 4 at a time */}
    <Box display='flex' alignItems='center' justifyContent='space-between' mb='3'>
      <Text fontSize='10px' fontWeight='500' color='whiteAlpha.400' letterSpacing='0.12em' textTransform='uppercase' > Themes </Text>
      {/* making the themes show only 4 at a time - conditional rendering*/}
      {Math.ceil(themesList.length / 4) > 1 && (
        <Text fontSize='10px' color='whiteAlpha.300'>{page + 1} / {Math.ceil(themesList.length / 4)}</Text>
      )}
    </Box>

    {/* two cards side by side only */}
    <Box display='grid' gridTemplateColumns='1fr 1fr' gap='2' mb='3'>
      {themesList.slice(page * 4, (page + 1) * 4).map((theme) => (
        // bringing back the functionality for each theme card
        <Box key={theme.id} borderRadius='14px' border={currTheme.id === theme.id ? `1px solid ${theme.navColor}88` : '0.5px solid rgba(255,255,255,0.08)'}
        bg='rgba(255,255,255,0.03)' position='relative' cursor='pointer' transition='all 0.18s' onClick={async () => {
            setCurrTheme(theme)
            setNavColorPick(theme.navColor)
            setBgColorPick(theme.bgColor)
            setFontPick(theme.font)
            setCurrentTheme(theme)
            axios.patch(`/dashboard/${dashboardId}`, { themeId: theme.id })
            //await getTheDash()
          }}
          _hover={{ transform: 'translateY(-1px)', borderColor: 'rgba(255,255,255,0.18)' }}>
          {/* displaying the colors side by side */}
          <Box display='flex' h='52px' borderRadius='13px 13px 0 0' overflow='hidden'>
            <Box flex='1' bg={theme.navColor} />
            <Box flex='1' bg={theme.bgColor} />
            <Box flex='1' bg={theme.font} />
          </Box>

          {/* title of the color - nav, bg, widget */}
          <Box display='flex' borderBottom='0.5px solid rgba(255,255,255,0.06)'>
            {colors.map((title, i) => (
              <Box key={title} flex='1' textAlign='center' py='1' fontSize='9px' color='whiteAlpha.400' letterSpacing='0.06em' borderRight={i < 2 ? '0.5px solid rgba(255,255,255,0.06)' : 'none'}>
              {title}
              </Box>
            ))}
          </Box>

        {/* for the public / active / and public maker button */}
        <Box px='2.5' pt='2' pb='1.5'>
          <Text fontSize='12px' fontWeight='500' color='whiteAlpha.900' mb='1.5' maxLines={1}>
              {theme.name}
            </Text>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Box display='flex' gap='1.5'>
            {currTheme.id === theme.id && (
                  <Box bg='rgba(56,189,248,0.15)' color='#38bdf8'
                    fontSize='8px' fontWeight='500' px='1.5' py='0.5'
                    borderRadius='20px' >
                    active
                  </Box>
                )}
                 <Box
                  bg={theme.public ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)'}
                  color={theme.public ? '#4ade80' : 'whiteAlpha.400'}
                  border={theme.public ? 'none' : '0.5px solid rgba(255,255,255,0.1)'}
                  fontSize='8px' fontWeight='500' px='1.5' py='0.5'
                  borderRadius='20px' >
                  {theme.public ? 'public' : 'private'}
                </Box>
            </Box>
            <Box display='flex' gap='1' onClick={(e) => e.stopPropagation()}>
                <Button
                  size='2xs' variant='ghost' minW='22px' h='22px' p='0'
                  borderRadius='6px' color='whiteAlpha.400'
                  border='0.5px solid rgba(255,255,255,0.08)'
                  _hover={{ color: 'whiteAlpha.800', bg: 'whiteAlpha.100' }}
                  onPointerDown={async (e) => {
                    e.preventDefault(); e.stopPropagation()
                    await makePublicTheme(theme);
                    setCurrTheme(theme)
                    setNavColorPick(theme.navColor)
                    setBgColorPick(theme.bgColor)
                    setFontPick(theme.font)
                    setEditingTheme(true)
                    
                  }}
                  title={theme.public ? 'Make private' : 'Make public'}
                >
                  {theme.public ? <IoPeopleSharp /> : <IoPeopleOutline /> }
                </Button>
                <Button
                  size='2xs' variant='ghost' minW='22px' h='22px' p='0'
                  borderRadius='6px' color='#f87171'
                  bg='rgba(248,113,113,0.08)'
                  border='0.5px solid rgba(248,113,113,0.2)'
                  _hover={{ opacity: 0.75 }}
                  onPointerDown={async (e) => {
                    e.preventDefault(); e.stopPropagation()
                    await deleteTheme({ themeId: theme.id })
                    
                  }}
                >
                  <IoTrashSharp />
                </Button>
              </Box>
          </Box>
        </Box>
        </Box>
      ))}
    </Box>


    {/* conditional rendering for more than 4 themes so that a page selection pops up */}
      {Math.ceil(themesList.length / 4) > 1 && (
      <Box display='flex' alignItems='center' justifyContent='center' gap='1.5' mb='3'>
        <Button
          size='xs' variant='ghost' minW='28px' h='28px' p='0' borderRadius='7px'
          color='whiteAlpha.500' border='0.5px solid rgba(255,255,255,0.08)'
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
        >‹</Button>

        {Array.from({ length: Math.ceil(themesList.length / 4) }, (_, i) => (
          <Button
            key={i} size='xs' variant='ghost'
            minW='24px' h='24px' p='0' borderRadius='6px'
            fontSize='10px'
            color={i === page ? 'whiteAlpha.900' : 'whiteAlpha.400'}
            bg={i === page ? 'whiteAlpha.100' : 'transparent'}
            border={i === page ? '0.5px solid rgba(255,255,255,0.2)' : '0.5px solid transparent'}
            _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
            onClick={() => setPage(i)}
          >{i + 1}</Button>
        ))}

        <Button
          size='xs' variant='ghost' minW='28px' h='28px' p='0' borderRadius='7px'
          color='whiteAlpha.500' border='0.5px solid rgba(255,255,255,0.08)'
          disabled={page === Math.ceil(themesList.length / 4) - 1}
          onClick={() => setPage((p) => p + 1)}
          _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
        >›</Button>
      </Box>
    )}



    <Text fontSize='10px' fontWeight='500' color='whiteAlpha.400' letterSpacing='0.12em' textTransform='uppercase' > Create a Theme </Text>
    <Box borderRadius='14px' border='0.5px solid rgba(255,255,255,0.08)' bg='rgba(255,255,255,0.03)' overflow='hidden' mt='3'>

  {/* color stack */}
  <Box display='flex' h='52px' borderRadius='13px 13px 0 0'>
    <Box flex='1' bg={navColorPick} />
    <Box flex='1' bg={bgColorPick} />
    <Box flex='1' bg={fontPick} />
  </Box>

  {/* color labels */}
  <Box display='flex' borderBottom='0.5px solid rgba(255,255,255,0.06)'>
    {['Nav', 'Bg', 'Widget'].map((t, i) => (
      <Box key={t} flex='1' textAlign='center' py='1' fontSize='9px'
        color='whiteAlpha.400' letterSpacing='0.06em'
        borderRight={i < 2 ? '0.5px solid rgba(255,255,255,0.06)' : 'none'}>
        {t}
      </Box>
    ))}
  </Box>

  <Box px='2.5' pt='2' pb='2.5'>
    {[
      { label: 'Navigation', value: navColorPick, setter: setNavColorPick },
      { label: 'Background', value: bgColorPick, setter: setBgColorPick },
      { label: 'Widget', value: fontPick, setter: setFontPick },
    ].map(({ label, value, setter }) => (
      <Box key={label} display='flex' alignItems='center' gap='2'
        py='1.5' borderBottom='0.5px solid rgba(255,255,255,0.06)'>
        <Text fontSize='11px' color='whiteAlpha.500' w='72px' flexShrink={0}>{label}</Text>

        <Color value={value} onValueChange={colorPicker(setter)} />
      </Box>
    ))}

    <Box display='flex' gap='2' mt='2.5'>
      <Button flex='1' size='sm' variant='ghost'
        color='whiteAlpha.400'
        border='0.5px solid rgba(255,255,255,0.1)'
        borderRadius='9px' fontSize='11px'
        _hover={{ bg: 'whiteAlpha.100' }}
        onClick={createTheme}
      >
        + Create
      </Button>
      <Button flex='1' size='sm'
        bg='rgba(99,102,241,0.2)' color='#818cf8'
        border='0.5px solid rgba(99,102,241,0.35)'
        borderRadius='9px' fontSize='11px'
        _hover={{ opacity: 0.8 }}
        onClick={() => {
          const updateThemeId = currTheme.id !== -1 ? currTheme.id : activeDash.id
          if(updateThemeId !== -1){
            updateTheme({ id: updateThemeId, navColor: navColorPick, bgColor: bgColorPick, font: fontPick })
          }
        }}
      >
      <IoPencilSharp /> Update
      </Button>
    </Box>
  </Box>

      </Box>
      
    </Box>

  )
}

export default Theme;