const prompt = readFileSync('inp').toString()

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import { asGen, getContentString, getHash, parseContent } from './content.mjs'
import { generate } from './api.mjs'

const INIT_HASH = '0000000000000000000000000000000000000000'

/**
 * @param {[string, ?string][]} prompts
 * @returns {Promise<void>}
 */
export async function parseGen(prompts) {
	/** @type {[string, ?string][]} */
	const gPrompts = []

	for (const [prompt, pHash] of prompts) {
		let gen = ''
		let writeFile = true

		if (pHash == null) { gen = readFileSync('init').toString() }
		if (pHash !== null && existsSync(join('objects', pHash))) {
			gen = asGen(readFileSync(join('objects', pHash)).toString())
			writeFile = false
			console.log(`Use exting: ${pHash}`)
		}

		if (gen === '') { gen = await generate(prompt) }

		const r1 = parseContent(gen)

		if (r1 === null) { throw new Error('Null content') }

		for (const opt of r1.options) {
			const inp = opt.option
			const hash = getHash(r1, inp ?? '')

			if (pHash != null && pHash === hash) { continue }

			console.log('Add to list:', hash, inp)

			gPrompts.push([`${prompt}${gen}\n\n> ${inp}\n\n`, hash])
		}

		if (writeFile) {
			console.log('Write file:', pHash ?? INIT_HASH)
			console.log(`${getContentString(r1)}\n`)

			writeFileSync(join('objects', pHash ?? INIT_HASH), getContentString(r1))
		}
	}

	await parseGen(gPrompts)
}

parseGen([[prompt, null]]).catch(console.error)

