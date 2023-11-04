const express = require('express');
const app = express();
const PORT = 8080; 
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { emailChecker } = require("./helpers");

app.use(cookieParser());
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['test1', 'test2']
}));

function generateRandomString() {
  const result = (Math.random() + 1).toString(36).substring(6);
  return result;
}

const urlsForUser = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

const addUser = (email, password) => {
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    hashedPassword
  };
  return id;
};

const users = {
};

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.facebook.com', userID: 'gtgd87' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'gtgd87' }
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.post('/logOn', (req,res) => {
  return res.redirect('/login');
});
 
app.post('/signUp', (req,res) => {
  res.redirect('/register');
});

app.post('/register', (req, res) => {
  const {email, password } = req.body;
  if (email === '' || password === '') {
    return res.status(400).send('400 Bad Request');
  }
  if (emailChecker(email, users)) {
    return res.status(400).send('Email Already Registered');
  }
  const user_id = addUser(email, password);
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render('urls_register', templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!emailChecker(email, users)) {
    res.status(403).send("Email not signed up.");
  } else {
    const user_id = emailChecker(email, users);
    if (user_id) {
      let valid = bcrypt.compare(password, users[user_id].hashedPassword);
      if (valid) {
        req.session.user_id;
        res.redirect("/urls");
      } else {
        res.status(403).send("Password incorrect");
      }
    }
  }
});


app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render('urls_login', templateVars);
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const shortURL = generateRandomString();
  const urlObject = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  urlDatabase[shortURL] = urlObject;
  res.redirect(`urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID);
  const templateVars = {
    user: users[userID],
    urls: userUrls
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    return res.redirect('/login');

  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  console.log(templateVars.longURL);
  res.render('urls_show', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!urlDatabase[req.params.shortURL]) {
    return res.send('Error, please check your short URL');
  }
  res.redirect(longURL);
});