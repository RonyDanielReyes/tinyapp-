const getUserIdFromEmail = function(email, database) {
  let foundUserId = null;
  for (const userId in database) {
    if (database[userId].email === email) {
      foundUserId = database[userId].id;
    }
  }

  return foundUserId;
};

const generateRandomString = function() {
  const randomString = Math.random().toString(36).substring(2, 8);

  return randomString;
};

const urlsForUser = function(id, database) {
  let userUrlList = [];

  for (const urlId in database) {
    const urlData = database[urlId];
    if (id === database[urlId].userID) {
      userUrlList.push({ id: urlId, ...urlData });
    }
  }
  return userUrlList;
};

module.exports = { getUserIdFromEmail, generateRandomString, urlsForUser };