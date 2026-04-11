import { FaCalendarAlt, FaEnvelope, FaLink, FaClock } from "react-icons/fa";
import type { IconType } from "react-icons";


import Calendar from './Calendar';
import Email from './Email';
import Link from './Link';
import Timer from './Timer';
import AiChat from './AiChat';

import type { WidgetSettings } from '../../types/LayoutTypes';

export type WidgetDefinition = {
  id: number;
  name: string;
  component: React.FC<{ widgetId: number; settings: WidgetSettings | null }>;
  icon: IconType;
};


const WidgetMap: Record<number, WidgetDefinition>= {
  1: {id: 1, name: 'Calendar', component: Calendar, icon: FaCalendarAlt},
  2: {id: 2, name: 'Email', component: Email, icon: FaEnvelope},
  3: {id: 3, name: 'Timer', component: Timer, icon: FaClock},
  4: {id: 4, name: 'Link', component: Link, icon: FaLink},
  5: { id: 5, name: 'AI Chat',  component: AiChat },
};

export default WidgetMap;

export { Calendar, Email, Link, Timer, AiChat };