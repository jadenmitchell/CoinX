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

const sharedSession = require("express-socket.io-session")

/**
 * socket.io server with express session sharing capabilities.
 */
class SocketServer {
    constructor() {
        // regular web socket
    }

    /**
     * configure our socket.io server to work with our express web server.
     * 
     * @param {any} webServer   web server instance
     */
    join(webServer) {
        this._io = require("socket.io")(webServer.server)
        this._io.use(sharedSession(webServer.session))
    }

    /**
     * socket.io application.
     */
    get io() {
        return this._io
    }
}

module.exports = SocketServer