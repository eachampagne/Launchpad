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


// import { useState, useEffect } from 'react';
// import { Link } from "react-router";
// import axios from 'axios';

function Theme ({dashId}: {dashId: number}) {
  // react hook needs to set theme


  

  return (
    <p>{dashId}</p>
  )
}

export default Theme;