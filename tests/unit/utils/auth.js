const user = Buffer.from('user1@email.com:password1').toString('base64');
const otherUser = Buffer.from('user2@email.com:password2').toString('base64');

module.exports = {
  authHeader: `Basic ${user}`,
  otherAuthHeader: `Basic ${otherUser}`,
};
