import { useState, useEffect } from "react";
import { Grid, Box } from "@chakra-ui/react"

import axios from 'axios';

//set types
type Layout = {
  id: number;
  gridSize: string;
  layoutElements: [];
};

function LayoutGallery({onSelect,}: {onSelect: (layoutId: number) => void;}) {
  const [layout, setLayout] = useState<Layout[]>([]);

  //when component is mounted fetch layouts
  useEffect(() => {
    //GET to backend endpoint
    axios.get('/layout/public')
    .then((res) => {
      //update state of layouts to be actual layout data
      setLayout(res.data);

    }).catch((err) => {
      console.log("Couldn't find any layouts:", err);
    });
  }, [])


  return (
    <>
      <h3>PUBLIC LAYOUTS</h3>
      <Grid>
       {layout.map((lay) => (
         <div key={lay.id}>
          <p>PREVIEW LAYOUT #{lay.id}</p>
          <button onClick={() => onSelect(lay.id)}> SelectLayout </button>
        </div>


      ))}
      </Grid>

    </>
  );
}

export default LayoutGallery;
