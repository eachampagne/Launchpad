import axios from 'axios'
import { Box } from "@chakra-ui/react";
import WidgetFrame from "./WidgetFrame"
import Calendar from './Calendar';
import Email from './Email';
import Timer from './Timer';


type Layout = {
  id: number;
  gridSize: string;
  layoutElements: LayoutElement[];

};

type LayoutElement = {
  id: number,
  posX: number,
  posY: number,
  sizeX: number,
  sizeY: number
  widget: {
  name: string
  };
}

const widgetMap: Record<string, React.FC>= {
  Calendar,
  Email,
  Timer
};




const gridCols = 19;
const gridRows = 12;
//px per grid unit
const snapSize = 60;



const LayoutCanvas = function({layout, editable=false, onLayoutChange}: { layout: Layout; editable?: boolean; onLayoutChange?: () => void; }){

  const handleResize = async ( elementId: number, posX: number, posY: number, sizeX: number, sizeY: number) => {
  try{
    await axios.patch(`/layout/${elementId}`, {
      widgetSettings: { posX, posY, sizeX, sizeY}
    })

  } catch (err) {
    console.log(err, 'Could not resize widget')
  }
}

  const handleDelete = async (elementId: number) => {
  try {
    await axios.delete(`/layout/${elementId}`);
    if (onLayoutChange) {
      onLayoutChange(); //refresh parent dashboard
    }
  } catch (err) {
    console.log("Could not delete widget", err);
  }
};

  return (
    <Box
    //Anchors absolute widgets
    position="relative"
    //Defines grid bounds
    width={`${gridCols * snapSize}px`}
    height={`${gridRows * snapSize}px`}
    border={editable ? "2px solid #e5e7eb" : "none"}
    backgroundColor="transparent"
    //Snaps grid to units
    backgroundSize={`${snapSize}px ${snapSize}px`}
    //Actual grid lines
    backgroundImage={editable? `
        linear-gradient(to right, #e5e7eb 1px, transparent 2px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 2px)
      ` :  "none"}
    >
      {layout.layoutElements.map((element) => {
      const WidgetComp = widgetMap[element.widget.name];
      if(!WidgetComp){
        return null
      }

      return (
        <WidgetFrame
        key={element.id}
        widgetId={element.id}
        posX ={element.posX}
        posY={element.posY}
        sizeX={element.sizeX}
        sizeY={element.sizeY}
        minWidth={1}
        minHeight={1}
        color='#e5e7eb'
        snapSize={snapSize}
        handleResizeOrMove={handleResize}
        onDelete={handleDelete}
        editActive={editable}
        >
        <WidgetComp />
        </WidgetFrame>
        )
      })}

    </Box>
  )
}

export default LayoutCanvas
