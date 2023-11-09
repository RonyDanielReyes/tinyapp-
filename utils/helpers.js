const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const findUserByEmail = (email, database) => {
  for (let userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (id, database) => {
  const userURLs = {};
  for (const urlId in database) {
    if (database[urlId].userID === id) {
      userURLs[urlId] = database[urlId];
    }
  }
  return userURLs;
};

const urlBelongsToUser = (shortURL, userID, database) => {
  const urlObject = database[shortURL];
  return urlObject && urlObject.userID === userID;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  urlBelongsToUser
};