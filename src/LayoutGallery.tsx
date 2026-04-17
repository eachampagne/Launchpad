import { useState, useEffect } from "react";
import { Grid, Box, Heading } from "@chakra-ui/react"

import axios from 'axios';

//set types
import type { Layout } from '../types/LayoutTypes';


type Props = {
  onSelect: (layoutId: number) => void;
  selectedLayoutId: number;
  currentLayoutId: number;
};

function LayoutGallery({onSelect, selectedLayoutId, currentLayoutId}: Props) {
  //const [layout, setLayout] = useState<Layout[]>([]);
  const [publicLayouts, setPublicLayouts] = useState<Layout[]>([]);
  const [privateLayouts, setPrivateLayouts] = useState<Layout[]>([]);

  //when component is mounted fetch both private and public layouts
  useEffect(() => {
  const fetchLayouts = async () => {
    try {
      //Variable for grabbing public and private layouts
      const publicRes = await axios.get('/layout/public');
      const privateRes = await axios.get('/layout/private');

        // Filter out private layouts that match the applied dashboard layout
      const filteredPrivate = privateRes.data
        .filter((layout: Layout) => layout.id !== currentLayoutId || privateRes.data.length === 1);
          setPublicLayouts(publicRes.data);
         setPrivateLayouts(filteredPrivate);
    } catch (err) {
      console.error("Couldn't fetch layouts:", err);
    }
  };
  fetchLayouts()
}, [currentLayoutId]);


  return (
    <>
      <Heading size="md" mb={4}>
        Public Layouts
      </Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
        {publicLayouts.map((lay) => {
          //const isSelected = lay.id === selectedLayoutId
          return(

          <Box
            key={lay.id}
            p={3}
            borderWidth="2px"
            borderRadius="md"
            cursor="pointer"
            color="gray.800"
            borderColor={
              lay.id === selectedLayoutId ? "orange.400" : "gray.300"
            }
            bg={lay.id === selectedLayoutId ? "orange.50" : "white"}
            //_hover={{ borderColor: "orange.300" }}
            onClick={() => onSelect(lay.id)}
          >
            <p>
              <b>Layout #{lay.id}</b>
            </p>
          </Box>
        )})}
      </Grid>
      <Heading size="md" mt={6} mb={4}>
        My Private Layouts
      </Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
        {privateLayouts.map((lay) => (
          <Box
            key={lay.id}
            p={3}
            borderWidth="2px"
            borderRadius="md"
            cursor="pointer"
            color="gray.800"
            borderColor={lay.id === selectedLayoutId ? "orange.400" : "gray.300"}
            bg={lay.id === selectedLayoutId ? "orange.50" : "white"}
            onClick={() => onSelect(lay.id)}
          >
            <p>
              <b>My Layout #{lay.id}</b>
            </p>
          </Box>
        ))}
      </Grid>
    </>
  );
}

export default LayoutGallery;
