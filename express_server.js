const { getUserIdFromEmail, generateRandomString, urlsForUser } = require('./helpers.js'); // import helper functions from helpers file
const express = require("express");
const app = express(); // use express
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session'); // use for cookie encryption
const bcrypt = require("bcryptjs"); // use for password hashing

app.set("view engine", "ejs"); // use ejs templates

app.use(express.urlencoded({ extended: true })); // use for response body parsing

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Server started up and listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// OBJECTS REPRESENTING PROJECT DATABASES

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  kJ4flL: {
    id: "kJ4flL",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

// GET AND POST REQUESTS

// Accessing homepage (index) in the browser redirects to another page. Different pages if user is logged in already or not.
app.get("/", (req, res) => {
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.redirect("/login");
  }

  if (currentUser) {
    return res.redirect("/urls");
  }
});

// Accessing /urls in browser returns a list of user's urls if they are logged in.
app.get("/urls", (req, res) => {
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.send('<h3>You must be logged in to view your urls.</h3></br></br><a href="/login">Go To Login Page</a>');
  }

  if (currentUser) {
    const userUrls = urlsForUser(currentUser.id, urlDatabase);
    const templateVars = { urls: userUrls, user: currentUser };
    return res.render("urls_index", templateVars);
  }
});

// Create a new url. If logged in, new url object is created and added to the database with a new random id.
app.post("/urls", (req, res) => {
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.send('<h3>You must be logged in to create a new short url.</h3></br></br><a href="/login">Go To Login Page</a>');
  }

  if (currentUser) {
    const shortUrl = generateRandomString();

    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };

    return res.redirect(`/urls/${shortUrl}`);
  }
});

// Accessing /urls/new in browser returns a page with a form to create a new url.
app.get("/urls/new", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser };

  if (!currentUser) {
    return res.redirect("/login");
  }

  if (currentUser) {
    return res.render("urls_new", templateVars);
  }
});

// Accessing /urls/:id in browser returns the details of a user's specific short url if they are logged in.
app.get("/urls/:id", (req, res) => {
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.send('<h3>You must be logged in to view your urls.</h3></br></br><a href="/login">Go To Login Page</a>');
  }
  
  if (currentUser) {
    const userUrls = urlsForUser(currentUser.id, urlDatabase);
    let allowUser = false;
    userUrls.forEach(url => {
      if (url.id === req.params.id) {
        allowUser = true;
      }
    });

    if (allowUser) {
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: currentUser };
      return res.render("urls_show", templateVars);
    } else {
      res.send('<h3>This url belongs to another user. Please create your own new url.</h3></br></br><a href="/urls/new">Create new url</a>');
    }
  }
});

// Delete a url if the user is logged in and it's their url.
app.post("/urls/:id/delete", (req, res) => {
  const currentUrlId = req.params.id;
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.send('<h3>You must be logged in to delete a url.</h3></br></br><a href="/login">Go To Login Page</a>');
  }

  if (currentUser) {
    const userUrls = urlsForUser(currentUser.id, urlDatabase);
    let allowUser = false;

    userUrls.forEach(url => {
      if (url.id === currentUrlId) {
        allowUser = true;
      }
    });

    if (allowUser) {
      delete urlDatabase[currentUrlId];
      return res.redirect("/urls");
    } else {
      return res.send('<h3>This url belongs to another user. Please create your own new url.</h3></br></br><a href="/urls/new">Create new url</a>');
    }
  }
});

// Edit a url if the user is logged in and it's their url.
app.post("/urls/:id", (req, res) => {
  const newLongUrl = req.body.longURL;
  const shortUrl = req.params.id;
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.send('<h3>You must be logged in to edit a url.</h3></br></br><a href="/login">Go To Login Page</a>');
  }

  if (currentUser) {
    const userUrls = urlsForUser(currentUser.id, urlDatabase);
    let allowUser = false;

    userUrls.forEach(url => {
      if (url.id === shortUrl) {
        allowUser = true;
      }
    });

    if (allowUser) {
      urlDatabase[shortUrl].longURL = newLongUrl;
      return res.redirect("/urls");
    } else {
      return res.send('<h3>This url belongs to another user. Please create your own new url.</h3></br></br><a href="/urls/new">Create new url</a>');
    }
  }
});

// Access a long url by putting the short url in the browser. Anyone can access, whether logged in or not.
app.get("/u/:id", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser };

  if (urlDatabase[req.params.id] === undefined) {
    return res.status(404).render("not_found", templateVars);
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    return res.redirect(longURL);
  }
});

// Access the register page
app.get("/register", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser };

  if (!currentUser) {
    return res.render("register", templateVars);
  }

  if (currentUser) {
    return res.redirect("/urls");
  }
});

// Register a new user. Has some validation in place. Hashes password before storing it.
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('<h3>Email and password must not be blank</h3></br></br><a href="/register">Go Back To Registration Page</a>');
  } else if (getUserIdFromEmail(req.body.email, users) !== null) {
    return res.status(400).send('<h3>Email is already registered. Please login instead.</h3></br></br><a href="/login">Go To Login Page</a>');
  } else {
    const userId = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password);

    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword
    };

    req.session.user_id = userId;
    res.redirect("/urls"); // Redirect to the newly created url page
  }
});

// Access the login page
app.get("/login", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser };

  if (!currentUser) {
    return res.render("login", templateVars);
  }

  if (currentUser) {
    return res.redirect("/urls");
  }
});

// Login a user. Verifies password & sets an encrypted cookie in the browser.
app.post("/login", (req, res) => {
  const currentUserEmail = req.body.userEmail;
  const loginUserId = getUserIdFromEmail(currentUserEmail, users);

  if (loginUserId === null) {
    return res.status(403).send('<h3>Cannot find a user with that email address. Please enter a valid user email address or register to become a user.</h3></br></br><a href="/login">Go Back To Login Page</a>');
  } else if (bcrypt.compareSync(req.body.password, users[loginUserId].password)) {
    const currentUserId = getUserIdFromEmail(currentUserEmail, users);
    req.session.user_id = currentUserId;
    res.redirect("/urls");
  } else {
    return res.status(403).send('<h3>Invalid password. Please enter a valid password.</h3></br></br><a href="/login">Go Back To Login Page</a>');
  }
});

// Logs a user out. Removes cookie from browser.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});