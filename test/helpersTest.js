const { assert } = require('chai');

const { getUserIdFromEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

describe('getUserIdFromEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserIdFromEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if an email that is not a user in our database is passed in', function() {
    const user = getUserIdFromEmail("user@example6.com", testUsers)
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});

describe('urlsForUser', function() {
  it('should return an array containing all url objects for a specific user id', function() {
    const user = urlsForUser("aJ48lW", testDatabase)
    const expectedUrlArray = [{id: "b6UTxQ", longURL: "https://www.tsn.ca", userID: "aJ48lW"}, {id: "i3BoGr", longURL: "https://www.google.ca", userID: "aJ48lW"}];
    assert.deepEqual(user, expectedUrlArray);
  });

  it('should return an empty array if an user id with no associated urls is passed in', function() {
    const user = urlsForUser("user2", testDatabase)
    const expectedUrlArray = [];
    assert.deepEqual(user, expectedUrlArray);
  });
});