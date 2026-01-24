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
// import { ColorPicker } from "@chakra-ui/react"
import axios from 'axios';



function Theme ({dashboard, ownerId}: {dashboard: { name: string, ownerId: number}, ownerId: number}) {
  const [themesList, setThemesList] = useState([] as {navColor: string, bgColor: string, font: string}[]);
  const [currTheme] = useState(themesList[0])
  console.log(currTheme);
  // first lets get all the themes of that user
  const allThemes = async () => {
    
    try {
      const test = await axios.get(`/theme/${ownerId}`);
      setThemesList(test.data);

    } catch (error) {
      console.error('Failed to get all of your themes', error);
    }
  }
  

  // POST to make a new theme
  // make sure field is completely filled out
  // const newTheme = async () => {
  //   const ownerId = dashboard.ownerId; // need to send this in the request as well
  //   try {
  //     if({isPublic: boolean, navColor: string, bgColor: string, font: string}, ownerId){
  //       // so if none of those fields are empty
  //       await axios.post('/theme', {isPublic, navColor, bgColor, font, ownerId})
  //     }
  //   } catch (error) {
  //     console.error('Failed to submit theme', error);
  //   }
  // }

// test


  useEffect(() => {
    // if the owner is provided
    if(dashboard.ownerId){
      allThemes();
    }
  }, [dashboard.ownerId])

  return (
    <>
    {
      themesList.map((theme) => {
        return <button>{theme.navColor}{theme.bgColor}{theme.font}</button>
      })
    }
      <form>
        <input type="text">{currTheme.navColor}</input>
      </form>
    </>
  )
}

export default Theme;