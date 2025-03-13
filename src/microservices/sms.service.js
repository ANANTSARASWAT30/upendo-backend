const config = require('../config/config');

// Destructure Twilio credentials (SID, Auth Token, and Phone number) from the config
const {sid, authToken, phone} = config.twilio;

const client = require('twilio')(sid, authToken);

// Function to send SMS to a list of contacts
// contacts: Array of user objects, each containing a phone number
// body: The message to be sent
async function sendSMSToContacts(contacts, body) {
  const msgPromises = contacts.map(async user => {
    return client.messages
      .create({body, from: phone, to: user.phone})
      .then(() => false)
      .catch(e => {
        console.log(e);
        return user;
      });
  });
  const failures = await Promise.all(msgPromises);
  return failures.filter(f => !!f);
}

module.exports = {
  sendSMSToContacts,
};
