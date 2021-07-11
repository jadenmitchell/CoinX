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
const valid = (input) => input.split(' ').every(function (str) { return validator.isAlphanumeric(str) })
// can include this in the webPageController in the future?
const ObjectId = require('mongoose').Types.ObjectId
const BitcoinGateway = require('../../api/bitcoinReceivePayments')

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
                if (!valid(settings.roomName))
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

                const newRoom = new Room({
                    name: settings.roomName,
                    owner: userId,
                    password: settings.password,
                    minWager: settings.minWager,
                    maxPlayers: settings.maxPlayers
                })

                await newRoom
                    .save()
                    .catch(err => console.log(err)) // DB error, kill everything.

                socket.currentRoom = newRoom
                //socket.join(newRoom.name)

                if (settings.isChallenger) {

                    if (settings.useBtc) {

                        // cancel deposit / challenger and just send to room? idk yet man.
                        if (!settings.btcWager) {
                            console.log('not valid bitcoin amount')
                            return
                        }

                        /*if (!validator.isCurrency(settings.fee, { allow_negatives: false, digits_after_decimal: [1, 2, 3, 4, 5, 6, 7, 8] })) {
                            console.log('not valid bitcoin amount')
                            return
                        }*/

                        socket.roomStep = 'choose-bitcoin-gateway'
                        socket.emit('server choose btc deposit', settings)
                        return
                    }
                    else if (settings.initWager != '0.00') {
                        socket.roomStep = 'choose-cash-gateway'
                        socket.emit('server choose cash deposit', settings)
                        return
                    }
                }

                socket.roomStep = 'pending-start'
                // ???? IDEK WHAT TO DO YET TO CREATE THE ROOM FR
                // HOW DO WE GET IT TO EXIST IN THE SERVER ??????????? SO CONFUSING
                // LETS TRY AND THINK OF SEVERAL APPROACHES AND LINK THE MOST EFFICIENT ONE.
                // redis , database, and cache!?!?!?!
                socket.emit('redirect to server', room)
                // todo: create server queue don't automatically create server, manage resources!
            })

            socket.on('create server btc deposit', async (settings) => {
                if (!socket.currentRoom) return

                if (socket.roomStep !== 'choose-bitcoin-gateway') return

                if (settings.gateway == 'native') {
                    if (!validator.isCurrency(settings.fee, { allow_negatives: false, digits_after_decimal: [1, 2, 3, 4, 5, 6, 7, 8] })) {
                        console.log('not valid bitcoin amount')
                        return
                    }

                    const newTransaction = new BitcoinGateway.Transaction(settings.fee, BitcoinGateway.TransactionType.Bitcoin)

                    const status = await this._gateway.link(newTransaction)
                    if (status === 'error-maxgap') {
                        // handle dis shit
                    }

                    const address = newTransaction.address.toString()
                    console.log(address)

                    if (validator.isBtcAddress(address))
                        console.log('valid')

                    socket.roomStep = 'awaiting-payment'
                    socket.emit('server btc deposit', { address: address, fee: settings.fee, expire: 15 })

                    this._gateway.on(address, (transaction) => {
                        socket.emit('server btc status', transaction.status)

                        if (status.complete) {
                            //we done
                        }

                        if (status.expired && !status.complete) {
                            //fuck u
                        }
                    })
                }
                else if (settings.gateway == 'open-node') {
                    // not working as of rn.
                }
            })
        })
    }
}

module.exports = Server