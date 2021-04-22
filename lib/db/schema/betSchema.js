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

const betSchema = new mongoose.Schema({
    token: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'token is required'],
    },
    room: {
        type: String,
        validate: [validator.isAlphanumeric, "Please provide a valid room name"],
        required: [true, 'name is required'],
    },
    host: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "host is required"]
        },
        winner: Boolean
    }],
    challenger: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "challenger is required"]
        },
        winner: Boolean
    }],
    pot: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number
    }]
}, { timestamps: true })

const Bet = mongoose.model("bet", betSchema)

module.exports = betSchema