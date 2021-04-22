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

const { resolve } = require('path')
const { readdir } = require('fs').promises

/**
 * autoloader.
 * @todo                    check interface compliance?
 * @param {any} directory   target directory
 */
async function* recursive(directory) {
    const dirents = await readdir(directory, { withFileTypes: true })
    for (const dirent of dirents) {
        const file = resolve(directory, dirent.name)
        if (file == 'index.js')
            continue
        if (dirent.isDirectory())
            yield* recursive(file)
        else yield file
    }
}

module.exports = recursive