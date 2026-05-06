import { prisma } from '../database/prisma.js';

import "dotenv/config";
import twilio, { Twilio } from 'twilio'
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

let client: Twilio | undefined;

if (process.env.NODE_ENV !== "test") {
    if (!accountSid || !authToken) {
      throw new Error("Missing Twilio environment variables");
    }
    client = twilio(accountSid, authToken);
}

const timerLookup: {[key: string]: NodeJS.Timeout} = {};

const timerCallback = async (userId: number, layoutElementId: number) => {
  console.info(`User ${userId}'s timer is up.`);

  // check if user has a phone number - verified - notifications are true
  // if so send the message - if not throw error

  
    
      const userNumber = await prisma.phoneNumbers.findUnique({
        where: {
          userId: userId
        }
      })
      console.log(userNumber, userId, 'TIMER TESTING')
      if(userNumber){
        if(userNumber.verified === true && userNumber.notifications === true){
          if (!client) {
            console.info("Twilio disabled (test mode), skipping SMS.");
          } else {
            try {
              await client.messages.create({
                body: "Timer is up!",
                from: "+18336574381",
                to: userNumber.contactNumber,
              });
            } catch (error) {
              console.error(
                error,
                "something went wrong when sending message with timer ending",
              );
            }
          }
        }
      }

    
  

  await prisma.timer.deleteMany({where: {
    ownerId: userId,
    layoutElementId
  }});
};

// TODO: more utility functions so router doesn't have to do as much nitty gritty database stuff

// returns a promise that resolves to the number of deleted timers
// (should be 1 or 0 - can't be > 1 because of unique constraint on layoutElementId)
// or rejects if there's an error
function clearTimer(userId: number, layoutElementId: number) {
  return new Promise((resolve: (value: number) => void, reject) => {
    prisma.timer.deleteMany({where: {
      ownerId: userId,
      layoutElementId
    }})
      .then((batchPayload) => {
        if (batchPayload.count > 0) {
          clearTimeout(timerLookup[layoutElementId]);
          delete timerLookup[layoutElementId];
        }
        resolve(batchPayload.count);
      })
      .catch((error) => {
        reject(error);
      })
  });
};

// initialize timeouts for any running timers
(async function () {
  console.info('Initializing timers:');
  let timerCount = 0;

  const timers = await prisma.timer.findMany({where: {paused: false}});

  timers.forEach((timer) => {
    const { ownerId: userId, layoutElementId } = timer;

    let remainingMs = (timer.expiresAt as Date).getTime() - Date.now();
    if (remainingMs < 0) {
      remainingMs = 0; // stop the negative timeout warning
    }

    const timeout = setTimeout(() => {
      timerCallback(userId, layoutElementId);
    }, remainingMs); // apparently NodeJS's setTimeout is different from the window one
    timerLookup[layoutElementId] = timeout;

    timerCount++;
  });

  console.info(`Successfully initialized ${timerCount} timers.`);
})();

export {timerLookup, timerCallback, clearTimer};