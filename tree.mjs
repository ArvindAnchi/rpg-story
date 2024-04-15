import { readFileSync } from 'fs'
import { join } from 'path'

import { parseContentFile } from './blobFile.mjs'

/**
 * @param {string} file
 * @param {Set<string>} visited
 */
function printStoryTree(file, lines = '', visited = new Set()) {
	try {
		if (lines === '') { console.log(file) }

		const content = parseContentFile(readFileSync(file).toString())

		for (let oIdx = 0; oIdx < content.options.length; oIdx++) {
			const last = oIdx === content.options.length - 1
			const pipe = last ? '  ' : '│ '
			const choice = last ? '└' : '├'
			const optHash = content.options[oIdx].hash
			const aVisited = visited.has(optHash)

			// console.log(`\x1b[2m${lines}${choice} \x1b[1m${content.options[oIdx].option}\x1b[0m`)
			console.log(`${lines}${choice} ${aVisited ? '< CIRC > ' : ''}${optHash}`)

			if (aVisited) { continue }

			visited.add(optHash)

			printStoryTree(join('objects', optHash), `${lines}${pipe}`, visited)
		}
	} catch (err) {
		if (err.code === 'ENOENT') {
			// console.log(`\x1b[2m${lines}└ \x1b[31;2mINCOMPLETE\x1b[0m`)
			return
		}

		console.error(err)
	}
}

printStoryTree(join('objects', '0000000000000000000000000000000000000000'))

