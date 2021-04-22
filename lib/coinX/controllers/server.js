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
const validator = require('validator')
// can include this in the webPageController in the future?
const ObjectId = require('mongoose').Types.ObjectId

class Server extends WebPageController {
    register() {
        const Room = this._db.model('Room')

        this.app.get('/server', this.isLoggedIn, (req, res) => {
            res.render('server')
        })

        this.io.on('connection', (socket) => {
            socket.on('create new server', async (settings) => {
                const userId = socket.handshake.session.passport?.user

                if (!userId)
                    return

                // todo : sanitize input for xss
                // you got the server fucked up .
                if (!settings.roomName || !settings.maxPlayers || !settings.initWager || !settings.minWager)
                    return // actually who are you sending this Bs to the server?
                if (isNaN(settings.maxPlayers) || isNaN(settings.initWager) || isNaN(settings.minWager))
                    return
                if (!validator.isAlphanumeric(settings.roomName))
                    return
                if (!validator.isCurrency(settings.initWager, { allow_negatives: false }) || !validator.isCurrency(settings.minWager, { allow_negatives: false }))
                    return
                if (settings.password.length > 25)
                    return
                if (settings.maxPlayers != 2 && settings.maxPlayers != 5 && settings.maxPlayers != 10)
                    return
                if (typeof settings.useBtc != 'boolean' || typeof settings.isChallenger != 'boolean')
                    return

                const existingRoom = await Room.findOne({
                    $or: [
                        { owner: userId },
                        { name: settings.roomName }
                    ]
                }).exec()

                if (existingRoom) {
                    if (existingRoom.name != settings.roomName) {
                        socket.emit('create server error',
                            "you've reached your maximum amount of servers allowed for your subscription")
                        return
                    }

                    // allow duplicate room names??? Think of the pros/cons.
                    socket.emit('create server error',
                        "server name already exists")
                    return
                }

                socket.emit('server deposit', {
                    initWager: settings.initWager,
                    useBtc: settings.useBtc,
                    apiKey: '6vs2py6kt4',
                    email: 'john@coinx.com'
                })

                /*
                const newRoom = new Room({
                    name: settings.roomName,
                    owner: userId,
                    password: settings.password,
                    minWager: settings.minWager,
                    maxPlayers: settings.maxPlayers
                })
                
                newRoom
                    .save()
                    .then(room => {
                        if (settings.isChallenger && settings.initWager != '0.00') {
                            socket.emit('server deposit', { btcAddress: {}, initWager: settings.initWager, useBtc: settings.useBtc })
                        }

                        socket.emit('render server ready')
                    })
                    .catch(err => console.log(err))
                    */
                // todo: create server queue don't automatically create server, manage resources!
            })
        })
    }
}

module.exports = Server