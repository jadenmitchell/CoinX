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
'use strict';

/**
 * @abstract
 */
class WebPageController {

    /**
     * our take at managing controller preprocessing through abstraction.
     * @param {any} redis       redis client
     * @param {any} db          database instance
     * @param {any} webServer   web server instance
     * @param {any} sockServer  web socket instance
     * @param {any} gateway     bitcoin payment gateway
     */
    constructor(redis, db, webServer, sockServer, gateway) {
        this._redis = redis
        this._db = db
        this._webServer = webServer
        this._sockServer = sockServer
        this._gateway = gateway
    }

    /**
     * express application.
     */
    get app() {
        return this._webServer.app
    }

    /**
     * socket.io application.
     */
    get io() {
        return this._sockServer.io
    }

    /**
     * used for preprocessing data that should come before the registry.
     */
    init() {
        console.log(this.constructor.name + ' has been loaded without a preprocessor.')
    }

    /**
     * default registry notif, alert the server somethings wrong?
     */
    register() {
        console.log(this.constructor.name + ' has not been registered properly.')
    }

    /**
     * is the user logged in?
     * @param {any} req     express request
     * @param {any} res     express response
     * @param {any} next    continue callback
     */
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next()

        res.redirect('/')
    }
}

module.exports = WebPageController