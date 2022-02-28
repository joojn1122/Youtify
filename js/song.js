var songId = 0
var songs = []
class Song{
	constructor(name, file, tag){
		this.name = name;
		this.file = file;
		this.tag = tag
		this.id = songId
		songId++
	}
	getName() {return this.name}
	getFile() {return this.file}
	getTag() {return this.tag}
	getType() {return this.file==null ? 'online' : 'offline'}
	getId(){return this.id}
}
