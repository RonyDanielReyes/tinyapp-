const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080; 

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
}

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "aaa",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "bbb",
  },
};

function getUserByEmail(email) {
 for (const key in users) {
  if (users[key].email === email) {
    return users[key];
  } 
 }
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true })); // Use bodyParser middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]], 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["user_id"],
    user: users[req.cookies["user_id"]],   
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    res.redirect("/register")
  };
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    username: req.cookies["user_id"], 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const ID = generateRandomString();
  urlDatabase[ID] = longURL;
  res.redirect(`/urls/${ID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
    }
})

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.post('/login', (req, res) => {
  const { email } = req.body;

  console.log("email", req);
  const user = getUserByEmail(email);

    if (user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(400).send('Bad Request - Invalid email or password');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id'); 
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Bad Request - Please provide an email and password");
    return;
  }

  for (const userId in users) {
    if (users[userId].email === email) {
      res.status(400).send("Bad Request - Email already registered");
      return;
    }
  }

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: email,
    password: password,
  };
  res.cookie('user_id', userID);
  res.redirect('/urls');
});
