const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { generateRandomString, findUserByEmail, urlsForUser, urlBelongsToUser } = require("./utils/helpers");
const PORT = 8080;
app.set("view engine", "ejs");
const urlDatabase = {
  aaaaaa: {
    longURL: "https://www.tsn.ca",
    userID: "aaaaaa",
  },
  bbbbbb: {
    longURL: "https://www.google.ca",
    userID: "bbbbbb",
  },
};
const users = {
  aaaaaa: {
    id: "aaaaaa",
    email: "a@a.com",
    password: "$2a$10$TjHOq2r4GIjKTvTL5NPfuun/yzFwt5UkTzd5L5lrnHU2BEXHM6/ja",
  },
  bbbbbb: {
    id: "bbbbbb",
    email: "b@b.com",
    password: "$2a$10$gzYAJBlhcAAqcMDJbE6sCu.D1To4nIuA.HJJOQYI4dnwDjE.bM8fu",
  },
};
for (const userID in users) {
  const plainTextPassword = users[userID].password;
  const hashedPassword = bcrypt.hashSync(plainTextPassword, 10);
  users[userID].password = hashedPassword;
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["asdfghjkl"],
}));
app.use(morgan("dev"));

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(401).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Not Authorized</title>
    </head>
    <body>
      <p>You must be logged in to be able to shorten URLs.</p>
    </body>
    </html>
  `);
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("User cannot be found.");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password does not match.");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be left blank.");
  }
  const user = findUserByEmail(email, users);
  if (user) {
    return res.status(400).send("A user with that email already exists.");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  if (!userID || !urlBelongsToUser(shortURL, userID, urlDatabase)) {
    return res.status(403).send("You do not have permission to delete this URL");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("The requested URL was not found on this server");
  }
  if (!userID || !urlBelongsToUser(shortURL, userID, urlDatabase)) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }
  urlDatabase[shortURL].longURL = req.body.newLongURL;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send(`
    <html>
      <body>
        <p>You must be <a href="/login">logged in</a> to view this page.</p>
      </body>
    </html>
    `);
  }
  const userURLs = urlsForUser(userID, urlDatabase);
  const user = users[userID];
  const templateVars = {
    urls: userURLs,
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID && users[userID]) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: null };
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID && users[userID]) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: null };
    res.render("login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.redirect("/login");
  }
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const urlObject = urlDatabase[shortURL];
  const userID = req.session.user_id;
  const user = users[userID];
  if (!urlObject) {
    return res.status(404).send("The requested URL was not found on this server.");
  }
  if (!userID) {
    return res.status(401).send(`
    <html>
      <body>
        <p>You must be <a href="/login">logged in</a> to view this page.</p>
      </body>
    </html>
    `);
  }
  if (!urlBelongsToUser(shortURL, userID, urlDatabase)) {
    return res.status(403).send("You do not have permission to view this page");
  }
  const templateVars = {
    id: shortURL,
    longURL: urlObject.longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("The short URL you are trying to access does not exist.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});