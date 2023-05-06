const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Set up routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/register', (req, res) => {
    const { email, firstname, lastname, password } = req.body;

    // Check if user already exists
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
        res.send('User already exists');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        email,
        firstname,
        lastname,
        password
    };
    users.push(newUser);
    saveUsers(users);

    // Set session cookie
    req.session.user = newUser;

    res.redirect('/dashboard');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists and password is correct
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        res.send('Invalid email or password');
        return;
    }

    // Set session cookie
    req.session.user = user;

    res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        res.redirect('/');
        return;
    }

    res.send(`Welcome ${req.session.user.firstname} ${req.session.user.lastname}! <a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res) => {
    // Clear session cookie
    req.session.destroy();

    res.redirect('/');
});

// Helper functions
function getUsers() {
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync('users.json', JSON.stringify(users));
}

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
