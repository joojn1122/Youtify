class Playlists{
    constructor() {
        this.list = []
        this.id = 0
    }
    add(file){
        this.list.push(new Playlist(file))
        this.id++
    }
    getById(id){
        for(let i=0;i<this.list.length;i++){
            var el = this.list[i]
            if (el.getId() == id){
                return el
            }
        }
    }
    remove(playlist){
        function arrayRemove(arr, value) { 
            return arr.filter(function(ele){ 
                return ele != value; 
            });
        }
        this.list = arrayRemove(this.list, playlist);
    }
    clear(){
        this.list = []
    }
    getList(){
        return this.list
    }
}

class Playlist{
	constructor(file){
		this.file = file;
		this.id = playlists.id
        this.reload()
	}
    reload(){
        var data = fs.readFileSync(`${config.playlistsPath}\\${this.file}`, 'utf-8')
        var json = JSON.parse(data)
        this.name = json.name
        this.songs = []
        for(let i=0;i<json.songs.length;i++){
            var jSong = json.songs[i]
            var song = new Song(jSong.name, jSong.file, jSong.tag)
            this.songs.push(song)
        }
    }
	getName() {return this.name}
	getFile() {return this.file}
	getTag() {return this.tag}
	getId(){return this.id}
    getSongs() {return this.songs}
}

const playlists = new Playlists()