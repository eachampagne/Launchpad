import { Box, Button, VStack, Heading } from "@chakra-ui/react";
import axios from "axios";

import WidgetMap from "./widgets";

function WidgetLibrary({ layoutId, onWidgetAdded }: {layoutId: number; onWidgetAdded: () => void;}) {
  const widgets = Object.values(WidgetMap);

  // Add widget to layout
  const addWidget = async (widgetId: number) => {
    try {
      await axios.post(`/layout/${layoutId}/element`, {
        widgetId,
        widgetSettings: {
          posX: 0,
          posY: 0,
          sizeX: 2,
          sizeY: 2,
        },
      });

      // Reload dashboard after adding
      onWidgetAdded();
    } catch (error) {
      console.error("Failed to add widget:", error);
    }
  };

  return (
    <Box mt={6}>
      <Heading size="md" mb={4}>
        Widget Library
      </Heading>

      <VStack align="stretch">
        {widgets.map((widget) => (
          <Button
            key={widget.id}
            onClick={() => addWidget(widget.id)}
          >
            Add {widget.name}
          </Button>
        ))}
      </VStack>
    </Box>
  );
}

export default WidgetLibrary;