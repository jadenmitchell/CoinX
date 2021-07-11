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

const http = require('http')
const express = require('express')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const bodyParser = require('body-parser')
const flash = require("connect-flash")

/**
 * simple express 5 web server wrapper contains a secure routing
 * system for ejs templating.
 */
class WebServer {
    /**
     * creates an instance of the web server.
     * 
     * @param {Object} opts  web server configuration
     */
    constructor(opts) {
        this._opts = opts
    }

    /**
     * express session/cookie store.
     */
    get session() {
        return this._session
    }

    /**
     * http server.
     * 
     * @protected
     */
    get server() {
        return this._server
    }

    /**
     * express application.
     */
    get app() {
        return this._app
    }

    /**
     * starts an express http server with sessions and ejs templating.
     */
    init(redis) {
        if (!this._opts)
            return;

        this._redis = redis
        this._app = express()

        /** creates portable http server behind express */
        this._server = http.createServer(this._app)

        this._app.set('views', this._opts.templates)
        this._app.set('view engine', 'ejs')

        this._app.use(express.static(this._opts.static))

        /* noCookies disables sessions. */
        if (!this._opts.noCookies)
            this.configureCookies()
    }

    /**
     * starts listening for incoming connections.
     */
    listen() {
        this._server.listen(this._opts.port, () => {
            console.log(`Example app listening at http://localhost:${this._opts.port}`)
        })
    }

    /**
     * configure express to work with server-side sessions.
     */
    configureCookies() {
        this._app.use(bodyParser.urlencoded({ extended: false }))

        /*  */
        this._session = session({
            store: new RedisStore({ client: this._redis.instance }),
            secret: this._opts.secret,
            resave: true,
            saveUninitialized: true,
            cookie: { secure: false, httpOnly: false, maxAge: 86400000 }
        })

        this._app.use(this._session)
        this._app.use(flash())
    }

    /**
     * simple app.get function wrap.
     * @deprecated      get .app for routing
     */
    get(url, handler) {
        return this._app.get(url, handler)
    }
    
    /**
     * @deprecated
     */
    post(url, handler) {
        return this._app.post(url, handler)
    }
    
    /**
     * @deprecated
     */
    use(middleware) {
        return this._app.use(middleware)
    }
}

module.exports = WebServer