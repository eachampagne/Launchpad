import { Box, Heading, IconButton, HStack, TooltipRoot, TooltipTrigger, TooltipContent} from "@chakra-ui/react";
import axios from "axios";

import WidgetMap from "./widgets";

function WidgetLibrary({ layoutId, textColor="white", onWidgetAdded }: { layoutId: number; textColor?: string; onWidgetAdded: () => void }) {
  const widgets = Object.values(WidgetMap);

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
      onWidgetAdded();
    } catch (error) {
      console.error("Failed to add widget:", error);
    }
  };

  return (
    <Box mt={6} color={textColor}>
      <Heading size="md" mb={4}>
        Widget Library
      </Heading>

      {/* Horizontal icon layout */}
      <HStack gap={4} flexWrap="wrap">
        {widgets.map((widget) => {
          const Icon = widget.icon;

          return (
            <TooltipRoot key={widget.id}>
              <TooltipTrigger asChild>
              <IconButton
                aria-label={`Add ${widget.name}`}
                onClick={() => addWidget(widget.id)}
                size="lg"
                variant="outline"
              >
                 <Icon />
               </IconButton>
              </TooltipTrigger>

              <TooltipContent>
              Add {widget.name}
              </TooltipContent>
            </TooltipRoot>
          );
        })}
      </HStack>
    </Box>
  );
}

export default WidgetLibrary;