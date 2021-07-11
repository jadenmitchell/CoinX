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
const bcrypt = require("bcrypt")
const validator = require('validator')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        validate: [validator.isEmail, "Please provide a valid email address"],
        required: [true, 'Email is required'],
        unique: true,
        uniqueCaseInsensitive: true
    },
    username: {
        type: String,
        required: [true, 'username is required'],
        unique: true,
        uniqueCaseInsensitive: true,
        maxlength: 25
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: 8,
    },
    wallet: {
        type: Number,
        default: 0
    }
})

userSchema.methods.toJSON = function () {
    const user = this;

    const userObj = user.toObject()
    delete userObj.password
    return userObj
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.statics.checkExistingField = async (field, value) => {
    const checkField = await User.findOne({ [`${field}`]: value })

    return checkField
}

const User = mongoose.model("User", userSchema)

module.exports = userSchema