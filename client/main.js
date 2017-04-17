const fs = require('fs')
const path = require('path')

let config = {
	tag_file: 'tag.json',
	db_file: 'db.json',
	account_offset: 510
}

let tag
if (fs.existsSync(config.tag_file))
	tag = require('./' + config.tag_file)
else {
	tag = {}
}

let db
if (fs.existsSync(config.db_file))
	db = require('./' + config.db_file)
else {
	db = {}
}

let insert = (r, dt) => {
	if (!db[r])
	db[r] = [dt]
	else {
		let m = db[r].reduce( (p, e) => {
			if (e.label == dt.label && e.count == dt.count)
			return true
			else
			return p || false
		}, undefined)

		if (m == false)
		(db[r] ? db[r].push(dt) : db[r] = [dt])
	}
}

let sync = () => {
	let files = fs.readdirSync('.')
	files = files.filter( e => path.extname(e) == '.csv')
	files.forEach( e => {
		console.log(`Found: ${path.basename(e, '.csv')}`)

		let f = fs.readFileSync(e, { encoding: 'utf8'}).toString()
		f.split('\n').map( e => {
			let a = e.split(';')
			let date = a[0]
			let label = a[1]
			let count = a[2]

			if (count && count != 'Montant(EUROS)') {
				let m = date.match(/(\d*)\/(\d*)\/(\d*)/)

				let dt = {
					date: new Date(m[3], parseInt(m[2]) - 1, m[1]).toDateString(),
					label: label.match(/"(.*)"/)[1],
					count: parseFloat(count.replace(',','.'))
				}

				let r = Object.keys(tag).reduce( (p, k) => {
					let tags = tag[k]

					let r = tags.reduce( (p, _) => {
						return p || label.toLowerCase().match(_.toLowerCase())
					}, undefined)

					return p || (r ? k : undefined)
				}, undefined)

				if (r)
					insert(r, dt)
				else {
					insert('unknown', dt)
				}
			}
		})
	})
}

sync()

let t = Object.keys(db).reduce( (p, k) => {
	let c = db[k].reduce( (p, e) => {
		return p + e.count
	}, 0)

	let ic = parseInt(c)
	let s = `${k}`
	for (var i = s.length; i < 16; i++) {
		s += " "
	}
	s += `${ic}`
	console.log(s)
	return p + c
}, config.account_offset || 0)
let it = parseInt(t)
let s = `total`
for (var i = s.length; i < 16; i++) {
	s += " "
}
s += `${it}`
console.log(s)

fs.writeFileSync('db.json', JSON.stringify(db, undefined, 2))
