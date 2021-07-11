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

const autoload = require('../../autoload')
const WebPageController = require('./webPageController')

/**
 * simple static http routing class.
 */
class WebServerRouter {
    /**
     * register routing functionality.
     * @param {any} redis       redis client
     * @param {any} db          database connection
     * @param {any} webServer   web server instance
     * @param {any} sockServer  web socket instance
     * @param {any} gateway     bitcoin payment gateway
     */
    static async register(redis, db, webServer, sockServer, gateway) {
        this._controllers = []

        for await (const file of autoload(__dirname + '/../../coinX/controllers')) {
            const CustomController = require(file)

            if (!CustomController instanceof WebPageController)
                continue

            const controller =
                new CustomController(
                    redis,
                    db,
                    webServer,
                    sockServer,
                    gateway
                )
            controller.init()

            this._controllers.push(controller)
        }

        for await (const controller of this._controllers) {
            controller.register()
        }
         
        webServer.get('/', (req, res) => {
            res.render('index')
        })

        webServer.use((req, res) => {
            res.status(404).render('404')
        })
    }
}

module.exports = WebServerRouter