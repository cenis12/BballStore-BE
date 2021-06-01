const express = require('express');
const router = express.Router();
const {database} = require('../server/connections');

/* GET users listing. */
router.get('/', function (req, res) {
    database.table('user')
        .withFields([ 'username' , 'email', 'firstname', 'lastname', 'role', 'id' ])
        .getAll().then((list) => {
        if (list.length > 0) {
            res.json({users: list});
        } else {
            res.json({message: 'NO USER FOUND'});
        }
    }).catch(err => res.json(err));
});

/**
 * ROLE 777 = ADMIN
 * ROLE 555 = CUSTOMER
 */


/* GET ONE USER MATCHING ID */
router.get('/:userId', (req, res) => {
    let userId = req.params.userId;
    database.table('user').filter({id: userId})
        .withFields([ 'username' , 'email','firstname', 'lastname', 'role', 'id' ])
        .get().then(user => {
        if (user) {
            res.json({user});
        } else {
            res.json({message: `NO USER FOUND WITH ID : ${userId}`});
        }
    }).catch(err => res.json(err) );
});

/* UPDATE USER DATA */
router.patch('/:userId', async (req, res) => {
    let userId = req.params.userId;     // Get the User ID from the parameter

    // Search User in Database if any
    let user = await database.table('user').filter({id: userId}).get();
    if (user) {

        let userEmail = req.body.email;
        let userPassword = req.body.password;
        let userFirstName = req.body.firstname;
        let userLastName = req.body.lastname;
        let userUsername = req.body.username;


        // Replace the user's information with the form data ( keep the data as is if no info is modified )
        database.table('user').filter({id: userId}).update({
            email: userEmail !== undefined ? userEmail : user.email,
            password: userPassword !== undefined ? userPassword : user.password,
            username: userUsername !== undefined ? userUsername : user.username,
            firstname: userFirstName !== undefined ? userFirstName : user.firstname,
            lastname: userLastName !== undefined ? userLastName : user.lastname,

        }).then(result => res.json('User updated successfully')).catch(err => res.json(err));
    }
});

module.exports = router;
