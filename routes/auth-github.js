const path = require('path');
const axios = require('axios');
const keys = require('../config/keys');
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

// console.log(new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate()));

/**
 * This is the client ID and client secret provided by GitHub
 * when you register for an OAuth app.
 */
const clientID = keys.clientID;
const clientSecret = keys.clientSecret;
const eventDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
let code = Math.floor(100000 + Math.random() * 900000)

// const createUserDb = (username, email) => {
//     const user = new User({
//         username,
//         email
//     })
//     user.save()
//         .then(result => {
//             console.log(result);
//         })
//         .catch(err => console.log(err));
// }

//Add Event date each user that signs in 
// const createEventDb = () => {
// const eventDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
//     const event = new Event({
//         date: eventDate
//     });
//     event.save()
//         .then(result => {
//             console.log(result._id);
//             Event.findOneAndUpdate({ date: eventDate }, { $push: { users: result._id } }, { new: true });
//         })
//         .catch(err => console.log(err));
// }
Event.create({ date: eventDate })
    .then(function (dbDate) {
        console.log(dbDate);
    }).catch(function (err) {
        console.log(err.message);
    });


module.exports = app => {

    /**
     * Route that GitHub redirects the user to
     * once they give access to the application.
     */
    app.get('/oauth/redirect', (req, res) => {
        const requestToken = req.query.code;

        /**
         * Post request to GitHub OAuth api with the client ID, 
         * client secret and request token. Request token is given
         * after user allows application access to their info.
         */
        axios({
            method: 'post',
            url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
            headers: {
                accept: 'application/json'
            }
        }).then((response) => {

            /** 
             * Once we get the response, extract the access token from
             * the response body
             */
            const accessToken = response.data.access_token;
            axios({
                method: 'get',
                url: 'https://api.github.com/user/emails',
                headers: {
                    'Authorization': "bearer " + accessToken
                }
            })
                .then(response => {
                    const data = response.data;

                    /**
                     * Loop through response and checks to see if 
                     * the data provided is the primary information of 
                     * the user.
                     */
                    data.forEach((item) => {
                        if (item.primary === true) {
                            axios({
                                method: 'get',
                                url: "https://api.github.com/user",
                                headers: {
                                    'Authorization': "bearer " + accessToken
                                }
                            })
                                .then(resp => {
                                    User.create({
                                        username: resp.data.login,
                                        email: item.email
                                    }).then(function (dbUser) {
                                        console.log(dbUser.email);

                                        return Event.findOneAndUpdate({}, { $push: { users: dbUser._id } }, { new: true })
                                    }).then(function (res) {
                                        console.log(res);

                                    }).catch(function (err) {
                                        console.log(err.message);
                                    });
                                    // createUserDb(resp.data.login, item.email);
                                    // createEventDb();
                                    // console.log(resp.data);
                                    res.redirect('/')
                                })
                        }
                    });
                });
        });
    });

    app.get("/populateduser", function (req, res) {
        // Find all users
        Event.find({})
            // Specify that we want to populate the retrieved users with any associated notes
            .populate("users")
            .then(function (dbUser) {
                // If able to successfully find and associate all Users and Notes, send them back to the client
                res.json(dbUser);
            })
            .catch(function (err) {
                // If an error occurs, send it back to the client
                res.json(err);
            });
    });
    app.get("/codeToday", function (req, res) {
        var lastUpdateTime = new Date().getTime();


        var currentTime = new Date().getTime();
        if (currentTime - lastUpdateTime >= 24 * 60 * 60 * 1000) // number of milliseconds in a day
        {
            // update cycleDay
            lastUpdateTime = currentTime;
            // ...
            code = Math.floor(100000 + Math.random() * 900000)
        }

        res.json(code)
    })
};
