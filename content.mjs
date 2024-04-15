import { createHash } from 'crypto'
import { parseContentFile } from './blobFile.mjs'

/**
 * @typedef {Object} Option
 * @property {string} option
 * @property {string} hash

 * @typedef {Object} Content
 * @property {number} day
 * @property {number} time
 * @property {string} content
 * @property {Option[]} options
 */

/**
 * @param {?Content} content Story content
 * @param {string} option Option string
 */
export function getHash(content, option) {
	return createHash('sha1')
		.update(`
			${content?.day}
			${content?.time}
			${content?.content.toLowerCase().replace(/[^a-z]/g, '')}
			${option.toLowerCase().replace(/[^a-z]/g, '')}
		`)
		.digest('hex')
}

/**
 * @param {?Content} content Story content
 */
export function getContentString(content) {
	if (content == null) { return '' }

	return [
		`${content.day} ${content.time.toString().padStart(4, '0')}`,
		`${content.content}`,
		`${content.options.map(v => `${v.hash} ${v.option}`).join('\n')}`
	].join('\n\n').trim()
}

/**
 * @param {string} content Raw story content
 * @returns {Content}
 */
export function parseContent(content) {
	/** @type {Content} */
	const c = {
		day: 0,
		time: 0,
		content: '',
		options: []
	}

	const lines = content.split('\n')
	let lIdx = 0

	const [day, time] = lines[lIdx].split('Time')

	c.day = Number(day.split(': ')[1])
	c.time = Number(time.split(': ')[1])

	lIdx++
	while (lIdx < lines.length - 1 && !lines[lIdx].startsWith('Options:')) {
		c.content += `${lines[lIdx]}\n`
		lIdx++
	}

	c.content = c.content.trim()

	while (lIdx < lines.length - 1) {
		lIdx++

		if (lines[lIdx].startsWith('Options:')) { continue }
		if (lines[lIdx].trim() === '') { continue }

		c.options.push({
			option: lines[lIdx].slice(3),
			hash: getHash(c, lines[lIdx]),
		})
	}

	return c
}

/**
 * @param {string} rContent Raw story content
 * @returns {string}
 */
export function asGen(rContent) {
	const content = parseContentFile(rContent)
	return [
		`Day: ${content.day} Time: ${content.time}`,
		content.content,
		'',
		'Options:',
		`${content.options.map(v => v.option).join('\n')}`
	].join('\n')
}

