import { useState, useEffect } from "react";
import { Grid, Box, Heading, Button } from "@chakra-ui/react";
import axios from "axios";
import type { Layout } from "../types/LayoutTypes";
import changeTextColor from './utilities/color.ts';

type Props = {
  onSelect: (layoutId: number) => void;
  selectedLayoutId: number;
  currentLayoutId: number;
  backgroundColor: string;
};

function LayoutGallery({ onSelect, selectedLayoutId, currentLayoutId, backgroundColor }: Props) {
  const [publicLayouts, setPublicLayouts] = useState<Layout[]>([]);
  const [privateLayouts, setPrivateLayouts] = useState<Layout[]>([]);

  const buttonColor = changeTextColor(backgroundColor); // also button background
  const buttonTextColor = changeTextColor(backgroundColor, "white", "black");
  const outlineColor = changeTextColor(backgroundColor, "gray.300", "gray.700");

  const fetchLayouts = async () => {
    try {
      const publicRes = await axios.get("/layout/public");
      const privateRes = await axios.get("/layout/private");

      const filteredPrivate = privateRes.data.filter(
        (layout: Layout) =>
          layout.id !== currentLayoutId || privateRes.data.length === 1,
      );

      setPublicLayouts(publicRes.data);
      setPrivateLayouts(filteredPrivate);
    } catch (err) {
      console.error("Couldn't fetch layouts:", err);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, [currentLayoutId]);

  const togglePublic = async (lay: Layout, e: any) => {
    e.stopPropagation();

    const res = await axios.patch(`/layout/${lay.id}/public`, {
      public: !lay.public
    });

    const updated = res.data;

    fetchLayouts()

    // if (updated.public) {
    //   setPrivateLayouts(prev => prev.filter(l => l.id !== updated.id));
    //   setPublicLayouts(prev => [...prev, updated]);
    // } else {
    //   setPublicLayouts(prev => prev.map(l => l.id === updated.id ? updated : l));
    //   setPrivateLayouts(prev => [...prev, updated]);
    // }
  };

  const deleteLayout = async (lay: Layout, e: any) => {
    e.stopPropagation();

    await axios.delete(`/layout/id/${lay.id}`);

    setPublicLayouts(prev => prev.filter(l => l.id !== lay.id));
    setPrivateLayouts(prev => prev.filter(l => l.id !== lay.id));
  };

  return (
    <>
      <Heading size="md" mb={4}>
        Public Layouts
      </Heading>

      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
        {publicLayouts.map((lay) => (
          <Box
            key={lay.id}
            p={3}
            borderWidth="2px"
            borderRadius="md"
            cursor="pointer"
            borderColor={
              lay.id === selectedLayoutId ? "orange.400" : outlineColor
            }
            bg="#00000000"
            onClick={() => onSelect(lay.id)}
          >
            <p>
              <b>Public Layout #{lay.id}</b>
            </p>

            <p>{lay.layoutElements?.length ?? 0} widgets</p>

            <Box display="flex" gap={2} mt={2}>
              <Button
                size="xs"
                colorScheme="red"
                onClick={(e) => deleteLayout(lay, e)}
                color={buttonTextColor}
                bgColor={buttonColor}
              >
                Delete
              </Button>

              <Button
                size="xs"
                colorScheme="yellow"
                onClick={(e) => togglePublic(lay, e)}
                color={buttonTextColor}
                bgColor={buttonColor}
              >
                Make Private
              </Button>
            </Box>
          </Box>
        ))}
      </Grid>

      <Heading size="md" mt={6} mb={4}>
         Private Layouts
      </Heading>

      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
        {privateLayouts.map((lay) => (
          <Box
            key={lay.id}
            p={3}
            borderWidth="2px"
            borderRadius="md"
            cursor="pointer"
            borderColor={
              lay.id === selectedLayoutId ? "orange.400" : outlineColor
            }
            bg="#00000000"
            onClick={() => onSelect(lay.id)}
          >
            <p>
              <b>Private Layouts #{lay.id}</b>
            </p>

            <p>{lay.layoutElements?.length ?? 0} widgets</p>

            <Box display="flex" gap={2} mt={2}>
              <Button
                size="xs"
                colorScheme="red"
                onClick={(e) => deleteLayout(lay, e)}
                color={buttonTextColor}
                bgColor={buttonColor}
              >
                Delete
              </Button>

              <Button
                size="xs"
                colorScheme="green"
                onClick={(e) => togglePublic(lay, e)}
                color={buttonTextColor}
                bgColor={buttonColor}
              >
                Make Public
              </Button>
            </Box>
          </Box>
        ))}
      </Grid>
    </>
  );
}

export default LayoutGallery;