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


import { useState, useEffect} from 'react';
import Color from './ColorPicker';
import axios from 'axios';



function Theme ({dashboard, ownerId, dashboardId}: {dashboard: { name: string, ownerId: number}, ownerId: number, dashboardId : number}) {
  const [themesList, setThemesList] = useState([] as {id: number, navColor: string, bgColor: string, font: string}[]);

  // const [form, setForm] = useState({navColor: 'white', bgColor: 'white', font: 'ariel'});
  const [color, setColor] = useState('test')
  const [navColorPick, setNavColorPick] = useState('#ff0000');
  const [bgColorPick, setBgColorPick] = useState('#ff0000');
  const [fontPick, setFontPick] = useState('#ff0000');
  const [activeDash, setActiveDash] = useState({id: -1, navColor: 'string', bgColor: 'string', font: 'string'});
  const [currTheme, setCurrTheme] = useState(activeDash);
  console.log(activeDash, 'HHEIEHEIEIHE')
  // first lets get all the themes of that user
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

  // for patch - update the theme on the current dashboard
  const updateTheme = async (data: any) => {
    try {
    return await axios.patch(`/dashboard/${dashboardId}`, data)
    }catch (error) {
        console.error(error, 'something went wrong is getTheDash')
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
    <div>
    {
      themesList.map((theme) => {
        return <ul>
          <button onClick={() => {
            setCurrTheme(theme);
            updateTheme({themeId: theme.id})
            }}> navColor: {theme.navColor} bgColor: {theme.bgColor} font: {theme.font}</button>
        </ul>
      })
    }
      <form>
        <label>navColor</label>
        <div id='navColor'>
          <Color onValueChange={colorPicker(setNavColorPick)} />
        </div>
        <label>bgColor</label>
        <div id='bgColor'>
          <Color onValueChange={colorPicker(setBgColorPick)}/>
        </div>
        <label>font</label>
        <div id='font'>
          <Color onValueChange={colorPicker(setFontPick)}/>
        </div>
      </form>
      <button onClick={createTheme}>CREATE</button>
    </div>
  )
}

export default Theme;