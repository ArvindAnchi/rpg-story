import { IncomingMessage, request } from 'http';

/**
 * @param {string} chunk 
 * @returns {?string}
 */
function processChunk(chunk) {
	try {
		if (!chunk.startsWith('data')) { return null }

		const pChunk = JSON.parse(chunk.slice(5))
		const gTxt = pChunk.choices[0].text
		const gFRes = pChunk.choices[0].finish_reason

		if (pChunk.choices[0].finish_reason != null) {
			console.log('\n---- GEN ----')
			console.log('\nStop reason:', gFRes)
			console.log('')
		}

		process.stdout.write(gTxt);

		return gTxt
	} catch (err) {
		console.log('\n---- ERROR ----')
		console.log(chunk)
		console.log(err)
		console.log('---- ERROR ----')

		process.exit(1)
	}
}

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export function generate(text) {
	const body = JSON.stringify({
		prompt: text,
		max_tokens: 1024,
		temperature_last: true,
		ban_eos_token: true,
		dynatemp_low: 0.8,
		dynatemp_high: 1.35,
		smoothing_factor: 0.4,
		min_p: 0.35,
		repetition_penalty: 1.15,
		repetition_penalty_range: 2800,
		mirostat_tau: 2,
		sampler_priority: [
			'top_k',
			'temperature',
			'repetition_penalty',
			'top_p',
			'min_p',
			'repetition_penalty_range',
			'top_a'
		],
		stream: true,
		grammar_string: `
			text ::= [a-zA-Z0-9:;-,.'"!? ]+

			date-line ::= "Day: " ([0-9][0-9]) " Time: " ([0-9][0-9][0-9][0-9])

			condition ::= (("[ if " text [=><!] text " ]") | "[ true ]")

			option-line ::= [0-9] ". " (condition " ") text "\n"
			options ::= (
			    "\n"
			    "Options:\n"
			    (option-line)
			    (option-line)
			    (option-line)?
			    (option-line)?
			)

			root ::= (
			    date-line "\n"
			    (text "\n")
			    options
			)`
	})

	/** @type {import('https').RequestOptions} */
	const options = {
		host: 'localhost',
		port: 5000,
		path: '/v1/completions',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(body, 'utf8')
		}
	};

	return new Promise(resolve => {
		let gen = ''

		console.log('---- GEN ----')
		/**
		 * @param {IncomingMessage} res
		 */
		function processRespose(res) {
			res.setEncoding('utf8');

			res.on('data', chunk => { gen += processChunk(chunk) });
			res.on('end', () => { resolve(gen) });
		}

		const req = request(options, processRespose)

		req.write(body)
		req.end();
	})
}

