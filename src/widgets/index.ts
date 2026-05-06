
import type { IconType } from "react-icons";
import { LuBot, LuCalendarDays, LuMail, LuTimer, LuLink, LuSearch} from "react-icons/lu";


import Calendar from './Calendar';
import Email from './Email';
import Link from './Link';
import Timer from './Timer';
import AiChat from './AiChat';
import Search from './Search';

import type { WidgetSettings } from '../../types/LayoutTypes';

export type WidgetDefinition = {
  id: number;
  name: string;
  component: React.FC<{ widgetId: number; textColor: string; settings: WidgetSettings | null }>;
  icon: IconType;
  defaultSize: { sizeX: number; sizeY: number };
};



const WidgetMap: Record<number, WidgetDefinition>= {
  1: {id: 1, name: 'Calendar', component: Calendar, icon: LuCalendarDays, defaultSize: { sizeX: 3, sizeY: 2}},
  2: {id: 2, name: 'Email', component: Email, icon: LuMail, defaultSize: {sizeX: 3, sizeY: 2}},
  3: {id: 3, name: 'Timer', component: Timer, icon: LuTimer, defaultSize: {sizeX: 5, sizeY: 3}},
  4: {id: 4, name: 'Link', component: Link, icon: LuLink, defaultSize: {sizeX: 3, sizeY: 2}},
  5: { id: 5, name: 'AI Chat',  component: AiChat, icon: LuBot, defaultSize: {sizeX: 4, sizeY: 2}},
  6: { id: 6, name: 'Search', component: Search, icon: LuSearch, defaultSize: {sizeX: 5, sizeY: 1} },
};

export default WidgetMap;

//add more props for min width and height and when created set at size with in width and heught then apply to props of widget frame

export { Calendar, Email, Link, Timer, AiChat, Search };