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
const autoload = require('../autoload')
const uniqueValidator = require('mongoose-unique-validator')

class DatabaseConnection {
    /*
     * uses mongoose ORM to connect to the mongoDB server.
     */
    constructor(opts) {
        mongoose.connect(`mongodb+srv://${opts.user}:${opts.pass}@${opts.database}?retryWrites=true&w=majority`,
            { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}).then(() => {
            console.log(`connected to the mongoDB at ${opts.database}`)
        }).catch(err => {
                console.log('falied to connect to mongoDB...', err)
                process.exit()
            })
    }

    /**
     * returns the mongoose db instance.
     */
    get instance() {
        return mongoose.connection
    }

    /**
     * auto load schemas.
     */
    async init() {
        for await (const file of autoload(__dirname + '/schema')) {
            const Schema = require(file)
            Schema.plugin(uniqueValidator)

            console.log(`loaded the database schema.`)
        }
    }
}

module.exports = DatabaseConnection