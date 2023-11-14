const { getUserIdFromEmail, generateRandomString, urlsForUser } = require('./helpers.js'); // import helper functions from helpers file
const express = require("express");
const app = express(); 
const PORT = 8080; 
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs"); 

app.set("view engine", "ejs"); 

app.use(express.urlencoded({ extended: true })); 

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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

app.get("/", (req, res) => {
  const currentUser = users[req.session.user_id];

  if (!currentUser) {
    return res.redirect("/login");
  }

  if (currentUser) {
    return res.redirect("/urls");
  }
});

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
    res.redirect("/urls");
  }
});

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

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});