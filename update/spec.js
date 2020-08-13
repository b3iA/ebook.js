"use strict";

const fs = require('fs');

class Spec
{
	constructor()
	{
		this.title = 'Default Title';
		this.creator = 'Default Creator';
		this.filename = 'Default Filename';
		this.filters = [];
		this.toc = [];
	}
	
	writeTo(filename)
	{
		let spec = [
			'{',
			'   "title": "' + this.title + '",',
			'   "creator": "' + this.creator + '",',
			'   "filename": "' + this.filename + '",',
			'   "output": ["html", "epub", "latex"],',
			'   "filters":',
			'   ['
		].join('\n');
		
		spec += '\n' + this.filters.map((f) => '\t\t"' + f + '"').join(',\n') + '\n';
		spec += '\t],\n\t"contents":\n\t[\n';
		spec += this.toc.map((t) => '\t\t{\n\t\t\t"title": "' + t[0] + '",\n\t\t\t"src": "' + t[1] + '"\n\t\t}').join(',\n');
		spec += '\n\t]\n}';
		
		fs.writeFileSync(__dirname + '/../specs/' + filename + '.json', spec, 'utf-8');
	}
}

module.exports.Spec = Spec;
