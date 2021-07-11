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

const redis = require('redis')
const { promisify } = require("util");

class RedisConnection {
    /*
     * redis caching.
     * @constructor
     */
    constructor(opts) {
        this._client = redis.createClient(opts.endpoint, {
            no_ready_check: true,
            auth_pass: opts.pass
        })

        this.getAsync = promisify(this._client.get).bind(this._client)
        this.setAsync = promisify(this._client.set).bind(this._client)
        this.saddAsync = promisify(this._client.sadd).bind(this._client)
        this.lremAsync = promisify(this._client.lrem).bind(this._client)
        this.lpopAsync = promisify(this._client.lpop).bind(this._client)
    }

    /**
     * returns the redis client.
     */
    get instance() {
        return this._client
    }
}

module.exports = RedisConnection