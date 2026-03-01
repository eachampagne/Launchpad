import type { EmailObject } from '../../types/Email.ts';

const demoEmails = [
  {
    id: 'reminder',
    snippet: 'Appointment reminder: Please remember you have a dentist appointment this Tuesday. If you need to reschedule, please call...'
  },
  {
    id: 'verification',
    snippet: 'Your verification code is...'
  },
  {
    id: 'scam',
    snippet: 'Dear user, you have won so much money!'
  },
] as EmailObject[];

// function is async for parity with API call

export async function getDemoEmails() {
  return demoEmails;
}