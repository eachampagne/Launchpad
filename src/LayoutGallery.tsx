import { useState, useEffect } from "react";
import { Grid, Box, Heading } from "@chakra-ui/react"

import axios from 'axios';

//set types
import type { Layout } from '../types/LayoutTypes';


type Props = {
  onSelect: (layoutId: number) => void;
  selectedLayoutId: number;
};

function LayoutGallery({onSelect, selectedLayoutId}: Props) {
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
      <Heading size="md" mb={4}>Public Layouts</Heading>
      <Grid  templateColumns="repeat(2, 1fr)" gap={3}>
       {layout.map((lay) => {
        const isSelected = lay.id === selectedLayoutId

        return(
          <Box
            key={lay.id}
            p={3}
            borderWidth="2px"
            borderRadius="md"
            cursor="pointer"
            color="gray.800"
            borderColor={isSelected ? "orange.400" : "gray.300"}
            bg={isSelected ? "orange.50" : "white"}
            _hover={{ borderColor: "orange.300" }}
            onClick={() => onSelect(lay.id)}
          >
          <p><b>Layout #{lay.id}</b></p>
          </Box>
        )
       })}
      </Grid>

    </>
  );
}

export default LayoutGallery;
