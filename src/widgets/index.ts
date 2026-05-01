
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
};

const WidgetMap: Record<number, WidgetDefinition>= {
  1: {id: 1, name: 'Calendar', component: Calendar, icon: LuCalendarDays},
  2: {id: 2, name: 'Email', component: Email, icon: LuMail},
  3: {id: 3, name: 'Timer', component: Timer, icon: LuTimer},
  4: {id: 4, name: 'Link', component: Link, icon: LuLink},
  5: { id: 5, name: 'AI Chat',  component: AiChat, icon: LuBot },
  6: { id: 6, name: 'Search', component: Search, icon: LuSearch },
};

export default WidgetMap;

export { Calendar, Email, Link, Timer, AiChat, Search };