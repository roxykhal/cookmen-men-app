const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')


//export model as it needs this to loop up users. crate accounts, fetch existing user credentials. without model
//controller would not be able to read/write user data

const User = require('../models/user.js')

router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in');
});

router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up')
})

router.post('/sign-up', async (req, res) => {
    const userInDatabase = await User.findOne ({ username: req.body.username});
    if (userInDatabase) {
        return res.send('This username already exists')
    }
    if(req.body.password !== req.body.confirmPassword) {
        return res.send('The passwords do not match')
    }

    //Hash the password before sending to the Database
    const HashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = HashedPassword;

    //ready to create the new user
    await User.create(req.body);
    res.redirect('/auth/sign-in')
    });

    router.post('/sign-in', async (req, res) => {
        try {
        //get the user from the database
        const userInDatabase = await User.findOne({ username: req.body.username });
        if(!userInDatabase) {
            return res.send('Login failed, please try again')
        }

        //if there is a user, compare the password from the one the user typed into the form(req.body)
        //and the one that was stored in the DB
        const validPassword = bcrypt.compareSync(
            req.body.password,
            userInDatabase.password
        );
        if(!validPassword) {
            return res.send('Login failed, please try again')
            
    }

    //req.session is an object provided by express-session. It exists to remember info about a user between
    //requests. HTTP forgets everything by default. Sessions are how you do not forget
    //attaching user to the session, means that you attach a user object to the users session
    //so anywhere in app you can use req.session.user. we do not store password as this shouldnt live in memory
    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id
    };

    res.redirect('/');
} catch (error) {
    console.log(error);
    //defined in server.js to render index
    res.redirect('/');
}
})
    module.exports = router;
