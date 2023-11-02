const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

// adding the function to generate 6 random alphanumeric characters
// function started
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}


app.set("view engine", "ejs");

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
    username: req.cookies["username"],  
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"], 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    username: req.cookies["username"],  // Add this line to pass the username
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

// Adding first part of week3 d2 assigment cookies and expresss
app.post('/login', (req, res) => {
  const { username } = req.body;

  if (username) {
    res.cookie('username', username);
    res.redirect('/urls');
  } else {
    res.status(400).send('Bad Request - Please provide a username');
  }
});
// Adding first part of week3 d2 assigment cookies and expresss

app.post("/logout", (req, res) => {
  res.clearCookie("username"); // Clear the username cookie
  res.redirect("/urls"); // Redirect to a page after logout
});