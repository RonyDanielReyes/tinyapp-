const express = require("express");
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
// function finished

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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
// check if the ID exists in the database
  if (urlDatabase[id]) {
    // delete the URL
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
    }
})

