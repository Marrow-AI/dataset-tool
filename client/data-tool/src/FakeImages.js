const writeJsonFile = require('write-json-file');

(async () => {
	await writeJsonFile('foo.json', {foo: true});
})();