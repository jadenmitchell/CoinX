/* Copyright 2016 Jaden M.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict'

const WebPageController = require('../../net/route/webPageController')
const passport = require("passport")
const LocalStrategy = require("passport-local")
const bcrypt = require('bcrypt')

class Login extends WebPageController {
    init() {
        this.app.use(passport.initialize())
        this.app.use(passport.session())
    }

    register() {
        const User = this._db.model('User')

        this.registerPassport(User)

        this.app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            next()
        })

        this.app.get('/logout', (req, res) => {
            //req.logout()
            req.session.destroy()
            res.redirect('/')
        })
    }

    registerPassport(User) {
        passport.serializeUser((user, done) => {
            done(null, user)
        })

        passport.deserializeUser((userId, done) => {
            User.findById(userId, (err, user) => done(err, user))
        })

        const local = new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
            try {
                const user = await User.findOne({
                    $or: [{ username }, { email: username }],
                })

                if (!user || !user.password) {
                    return done(null, false, { message: 'Incorrect email or password.' })
                }

                const checkPassword = await user.comparePassword(password)

                if (!checkPassword) {
                    return done(null, false, { message: 'Incorrect email or password.' })
                }
                return done(null, user, { message: 'Logged In Successfully' })
            } catch (err) {
                console.log(err)
                return done(null, false, { statusCode: 400, message: err.message })
            }
        })

        
        passport.use("local", local)

        this.app.post('/login', (req, res) => {
            passport.authenticate('local', {
                successRedirect: '/dash',
                failureRedirect: '/',
                failureFlash: true
            })(req, res, () => {
                res.redirect('/')
            })
        })

        this.app.post('/register', async (req, res) => {
            let errors = []

            const username = req.body['register-username']
            const email = req.body['register-email']
            const password = req.body['register-password']
            const password2 = req.body['register-password2']
            if (!username || !email || !password || !password2) {
                errors.push({ msg: 'Please enter all fields' })
            }

            if (username.length < 4) {
                errors.push({ msg: 'Username too short' })
            }
        
            if (password != password2) {
                errors.push({ msg: 'Passwords do not match' })
            }

            if (password.length < 6) {
                errors.push({ msg: 'Password must be at least 6 characters' })
            }

            if (errors.length > 0) {
                res.render('register', {
                    errors,
                    username,
                    email,
                    password,
                    password2
                })
            } else {
                const checkEmail = await User.checkExistingField('email', email)
                if (checkEmail) {
                    errors.push({ msg: 'Email already exists' })
                    res.render('register', {
                        errors,
                        username,
                        email,
                        password,
                        password2
                    })
                    return
                }

                const checkUserName = await User.checkExistingField('username', username)
                if (checkUserName) {
                    errors.push({ msg: 'Username already exists' })
                    res.render('register', {
                        errors,
                        username,
                        email,
                        password,
                        password2
                    })
                    return
                }

                const newUser = new User({ email, username, password })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/')
                            })
                            .catch(err => console.log(err))
                    })
                })
            }
        })
    }
}

module.exports = Login