import Calendar from './Calendar';
import Email from './Email';
import Link from './Link';
import Timer from './Timer';

import type { WidgetSettings } from '../../types/LayoutTypes';

const WidgetMap: Record<string, { id: number, name: string, component: React.FC<{widgetId: number, settings: WidgetSettings | null}> }>= {
  1: {id: 1, name: 'Calendar', component: Calendar},
  2: {id: 2, name: 'Email', component: Email},
  3: {id: 3, name: 'Timer', component: Timer},
  4: {id: 4, name: 'Link', component: Link}
};

export default WidgetMap;

export { Calendar, Email, Link, Timer };