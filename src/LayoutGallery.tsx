import { useState, useEffect } from "react";
import axios from 'axios';

//set types
type Layout = {
  id: number;
  gridSize: string;
  layoutElements: [];
};

function LayoutGallery({onSelect}: {onSelect: (layoutId: number) => void}) {
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
      <h3>LAYOUT GALLERY</h3>
      {/* <button onClick={() => setLayout([1, 2, 3])}>
        fake loads
        </button> */}
       {layout.map((lay) => (
         <div key={lay.id}>
          <p>LAYOUT #{lay.id}</p>
          <button onClick={() => onSelect(lay.id)}> SELECT LAYOUT </button>
        </div>

      ))}

    </>
  );
}

export default LayoutGallery;
