type CalendarSettings = {
  defaultCalendar: string
};

export type WidgetSettings = {
  calendar: CalendarSettings | null
};

export type Layout = {
  id: number;
  gridSize: string;
  layoutElements: LayoutElement[];
};

export type LayoutElement = {
  id: number;
  posX: number;
  posY: number;
  sizeX: number;
  sizeY: number;
  widget: {
    name: string
  },
  settings: WidgetSettings | null
};

export type Dashboard = {
  id: number;
  name: string;
  layout: Layout
  ownerId: number;
  layoutId: number | null;
};