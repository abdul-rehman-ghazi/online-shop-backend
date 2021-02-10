import * as admin from 'firebase-admin';
import winston from 'winston';

export const sendNotification = (
  topic: string,
  title?: string,
  message?: string,
  data?: any
) => {
  // The topic name can be optionally prefixed with "/topics/".

  const notification = {
    notification: {
      title: title ?? 'Title',
      body: message ?? 'Message'
    },
    data: data,
    topic: topic.toString()
  };

  admin
    .messaging()
    .send(notification)
    .then((response) => {
      // Response is a message ID string.
      winston.log('info', `Successfully sent message: ${response}`);
    })
    .catch((error) => {
      winston.log('error', `Error sending message: ${error}`);
    });
};
