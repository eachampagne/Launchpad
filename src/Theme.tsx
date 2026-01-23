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
// import { Link } from "react-router";
import axios from 'axios';

function Theme ({dashboard}: {dashboard: { name: string, ownerId: number}}) {
  const [themesList, setThemesList] = useState([] as {navColor: string, bgColor: string, font: string}[]);
  // react hook needs to set theme
  //const [ownerId, setOwnerId] = useState({ownerId: -1});
  console.log(dashboard, 'THIS IS THE DASH OBJECT')
  console.log(themesList, 'CAN YOU SEE THISSSSSS')
  // first lets get all the themes of that user
  const allThemes = async () => {
    const ownerId  = dashboard.ownerId;
    try {
      const test = await axios.get(`/theme/${ownerId}`);
      setThemesList(test.data);

    } catch (error) {
      console.error('Failed to get all of your themes', error);
    }
  }
  
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
        console.log(theme)
        return <div>{theme.navColor}{theme.bgColor}{theme.font}</div>
      })
    }
    </>
  )
}

export default Theme;