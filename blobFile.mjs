import { readFileSync, writeFileSync } from 'fs'
import * as _ from './content.mjs'

/**
 * @param {string} content
 * @returns {_.Content}
 */
export function parseContentFile(content) {
	/** @type {_.Content} */
	const c = {
		day: 0,
		time: 0,
		content: '',
		options: []
	}

	let lIdx = 0

	const lines = content.split('\n')
	const [d, t] = lines[lIdx].split(' ')

	c.day = Number(d)
	c.time = Number(t)

	lIdx++

	while (lIdx < lines.length && lines[lIdx] !== '') {
		c.content += lines[lIdx] + '\n'
		lIdx++
	}

	lIdx++
	lIdx++

	c.content = c.content.trim()

	while (lIdx < lines.length - 1) {
		lIdx++

		if (lines[lIdx] === '') { continue }

		c.options.push({
			hash: lines[lIdx].split(' ')[0],
			option: lines[lIdx].split(' ').slice(1).join(' ')
		})
	}

	return c
}
