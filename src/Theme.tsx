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



function Theme ({dashboard, ownerId}: {dashboard: { name: string, ownerId: number}, ownerId: number}) {
  const [themesList, setThemesList] = useState([] as {navColor: string, bgColor: string, font: string}[]);
  const [currTheme, setCurrTheme] = useState(themesList[0]);
  // const [form, setForm] = useState({navColor: 'white', bgColor: 'white', font: 'ariel'});
  const [color, setColor] = useState('test')
  const [navColorPick, setNavColorPick] = useState('#ff0000');
  const [bgColorPick, setBgColorPick] = useState('#ff0000');
  const [fontPick, setFontPick] = useState('#ff0000');
  // first lets get all the themes of that user
  // console.log(test, 'testing')
  console.log(navColorPick , 'nav', bgColorPick, 'bg', fontPick, 'font')
  const allThemes = async () => {
    
    try {
      const test = await axios.get(`/theme/${ownerId}`);
      setThemesList(test.data);

    } catch (error) {
      console.error('Failed to get all of your themes', error);
    }
  }
  
  const colorPicker = (e: any) => {
    setColor(e.value.toString('hex'));
    //console.log(e.value.toString('hex'))
    //setNavColorPick(e.value.toString('hex'))
    
  }

  // const createTheme = async () => {
  //   try {
  //     await axios.post('/theme', {
  //       public: false,
  //       navColor: navColorPick,
  //       bgColor: bgColorPick,
  //       font: fontPick,
  //       ownerId: ownerId
  //     })
  //     allThemes();
  //   } catch (error) {
  //     console.error(error, 'something went wrong')
  //   }
  // }

// test
// const picker = Color();

  useEffect(() => {
    // if the owner is provided
    if(dashboard.ownerId){
      allThemes();
    }
  }, [dashboard.ownerId])

  return (
    <div>
    {
      themesList.map((theme) => {
        return <ul>
          <button onClick={() => setCurrTheme(theme)}> navColor: {theme.navColor} bgColor: {theme.bgColor} font: {theme.font}</button>
        </ul>
      })
    }
      <form>
        <label>navColor</label>
        <div id='navColor'>
          
          <Color onValueChange={(color) => setNavColorPick(color.toString('hex'))} />
        </div>
        <label>bgColor</label>
        <div id='bgColor'>
          <Color onValueChange={(color) => setBgColorPick(color.toString('hex'))}/>
        </div>
        <label>font</label>
        <div id='font'>
          <Color onValueChange={(color) => setFontPick(color.toString('hex'))}/>
        </div>
      </form>
      <button>CREATE</button>
    </div>
  )
}

export default Theme;