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

const mongoose = require('mongoose')
const validator = require('validator')

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        validate: [validator.isAlphanumeric, "please provide a valid room name"],
        required: [true, 'name is required'],
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'owner is required']
    },
    challenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    opponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    password: String,
    minWager: {
        type: String,
        validate: [validator.isCurrency, "minWager is not a valid currency"],
        default: '0.00'
    },
    maxPlayers: {
        type: Number,
        enum: [2, 5, 10],
        default: '2'
    },
    pot: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number
    }]
}, { timestamps: true })

const Room = mongoose.model("Room", roomSchema)

module.exports = roomSchema