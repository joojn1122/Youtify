class PlaylistWindow{
    
    reload(){
        // design
        d.getElementById("playlists").style.color = "white"
        d.getElementById("playlists").style.backgroundColor = "#b3b3b331";
        d.getElementById("search").style.color = null
        d.getElementById("search").style.backgroundColor = null
        // reset cont
        content.textContent = ""
        var plContent = d.createElement('div')
        plContent.id = "playlist-cont"
        this.plContent = plContent
        content.appendChild(this.plContent)
        // load playlists
        var pls = fs.readdirSync(config.playlistsPath)
        playlists.clear()
        for(let i=0;i<pls.length;i++){
            if(pls[i].endsWith('.json')){
                playlists.add(pls[i])
            }
        }
    }
    show(){
        // showed text
        var p = document.createElement("p")
        p.classList.add("customText")
        p.setAttribute("data-text", language.message)
        this.plContent.appendChild(p)
        // local songs
        this.allSongs()
        // addOnScreen
        playlists.getList().forEach(pl => {
            var ob = this.addOnScreen(pl)
            var div = ob[0]
            var img = ob[1]

            div.addEventListener('click', (e) => {
                if(!(this.clickTest(e.target))) {return}
                e.preventDefault()

                pl.reload()
                songWindow.setPlaylist(pl)
                songWindow.show()
            })
            img.addEventListener('click', (e) => {
                e.preventDefault()
                Swal.fire({
                    title : language.playlist_remove_title.replace("%playlist%", pl.getName()),
                    text : language.playlist_remove_text,
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: language.yes,
                    denyButtonText: language.no,
                    confirmButtonColor: "#1DCF5C",
                    denyButtonColor: "#F27474",
                    background: "#181818",
                    color: 'white'
                }).then((result) => {
                if (result.isConfirmed) {
                    var dir = config.playlistsPath + "\\" + pl.getFile()
                    try {
                        fs.unlinkSync(dir)
                      } catch(err) {
                        config.error(err)
                        console.error(err)
                        return
                      }
                    }
                    playlistWindow.reload()
                    playlistWindow.show()
                })
            })
        })
    }
    addOnScreen(pl){
        var p = d.createElement('p')
        var div = d.createElement('div')
        var img = d.createElement("div")

        img.classList.add("removePlBtn")
        div.classList.add("playlist")
        p.setAttribute('data-text', pl.getName())

        div.appendChild(p)
        div.appendChild(img)
        this.plContent.appendChild(div)
        return [div, img]
    }

    // local storage songs (multi function)
    allSongs(){
        var newDiv = d.createElement("div")
        newDiv.classList.add("playlist")
        newDiv.addEventListener("click", () => {
            try{var files = fs.readdirSync(config.songsPath)}
            catch(e){console.error(e)}
            
            content.textContent = ""
            var c = songWindow.newSongCont()
            content.appendChild(c)

            if(files.length == 0){
                var p = d.createElement("p")
                p.classList.add("notFound")
                p.textContent = language.songs_not_found[0]
                this.songContent.appendChild(p)
                var p = d.createElement("p")
                p.classList.add("notFound")
                p.textContent = language.songs_not_found[1]
                this.songContent.appendChild(p) 
                var p = d.createElement("p")
                p.classList.add("notFound")
                p.innerHTML = language.songs_not_found[2] + ": <span id='openSongExplorer'>" + config.songsPath + "</span>"
                this.songContent.appendChild(p)
                d.getElementById("openSongExplorer").addEventListener('click', () => {
                    child.exec('explorer "' + config.songsPath +'"');
                })
                return
            }
            
            files.forEach((file) => {
                if(file.endsWith(".mp3") || file.endsWith(".wav") || file.endsWith(".ogg")){
                    var newDiv = document.createElement("div")
                    var removeButton = d.createElement('div')
                    var addButton = d.createElement('div')
                    var newP = document.createElement("p")

                    newP.setAttribute("data-text", file)
                    addButton.classList.add('addPlButton')
                    addButton.classList.add('unselectable')
                    addButton.textContent = "+"
                    removeButton.classList.add('removePlBtn')
                    newDiv.classList.add("song")
                    newDiv.classList.add("downloaded")
                    newDiv.setAttribute("file", file)

                    newDiv.addEventListener("click", (e) => {
                        if(!(this.clickTest(e.target))) {return}
                        var object = new class { 
                            constructor(){
                                this.file = file
                                this.name = path.parse(file).name
                            }
                            getName(){ return this.name}
                            getFile() { return this.file}
                            getType() {return "offline"}
                        }
                        songWindow.setSong(object)
                        playSound()
                        // selectedPlaylist
                        // this.pushPlayingSongs("$local")
                    })
                    removeButton.addEventListener('click', (e) => {
                        e.preventDefault()
                        var pls = fs.readdirSync(config.playlistsPath)
                        pls.forEach(pl => {
                            var datas = fs.readFileSync(`${config.playlistsPath}\\${pl}`, 'utf-8')
                            var json = JSON.parse(datas)

                        })


                        var dir = `${config.playlistsPath}\\${this.playlist.getFile()}`
                        var json = JSON.parse(fs.readFileSync(dir,'utf-8'))
                        for(let i=0;i<json.songs.length;i++){
                            if ((json.songs[i].file == song.getFile()) && (json.songs[i].name == song.getName())){
                                json.songs.splice(i, 1)
                                break
                            }else if((json.songs[i].tag == song.getTag()) && (json.songs[i].name == song.getName())){
                                json.songs.splice(i, 1)
                                break
                            }
                        }
                        json = JSON.stringify(json, null, 4)
                        fs.writeFileSync(dir, json, 'utf-8')
                        this.playlist.reload()
                        this.show()
                    })
    
                    newDiv.appendChild(newP)
                    newDiv.appendChild(addButton)
                    newDiv.appendChild(removeButton)
                    
                    c.appendChild(newDiv)
                    
                    
                }
            })

        })
            
        this.plContent.appendChild(newDiv)
        var newP = document.createElement("p")
        newP.setAttribute("data-text", language.local_storage)
        newP.classList.add('localSongs')
        newDiv.appendChild(newP)
    }
    clickTest(el){
        var test = true
        var classes = ['removePlBtn','addPlButton']
        if (el.classList.length == 0) { return test}
        el.classList.forEach(c => {
            classes.forEach(c2 => {
                if(c2 === c){
                    test = false
                }
            })
        })
        return test
    }
    // local storage songs
    pushPlayingSongs(selectedPlaylist){
        if(!(selectedPlaylist)){return}
        this.selectedPlaylist = selectedPlaylist
        this.playingSongs = []
        if(this.selectedPlaylist == "$local"){
            var data = fs.readdirSync(config.songsPath)
            for(let i=0;i<data.length;i++){
                if(data[i].endsWith(".mp3" || ".wav" || ".ogg")){
                    if(this.currentSong == data[i]){
                        this.playingSongsIndex = i
                    }
                    var json = {"file" : data[i], "title" : path.parse(data[i]).name}
                    this.playingSongs.push(json)
                }
            }
        }else{
            var dir = config.playlistsPath + "\\" + this.selectedPlaylist
            var data = fs.readFileSync(dir, 'utf8')
            var json = JSON.parse(data)
            for(let i=0;i<json['songs'].length;i++){
                if(this.currentSong == json['songs'][i]['file']){
                    this.playingSongsIndex = i
                }
                this.playingSongs.push(json['songs'][i])    
            }
        }
    }

}

// function to download songs from youtube
function ytdl(tag, playlistName){
  var YD = new YoutubeMp3Downloader({
      "ffmpegPath": config.ffmpeg,        // FFmpeg binary location
      "outputPath": config.songsPath,    // Output file location (default: the home directory)
      "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
      "queueParallelism": 2,                  // Download parallelism (default: 1)
      "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
      "allowWebm": false                      // Enable download from WebM sources (default: false)
  });
  YD.download(tag);
  YD.on("finished", function(err, data) {
    var videoId = data['videoId']
    var videoTitle = data['videoTitle']
    var dir = config.playlistsPath + "\\" + playlistName
    var json = fs.readFileSync(dir, 'utf8')
    json = JSON.parse(json)
    try{
        for(let i=0;i<json['songs'].length;i++){
            var tag = json['songs'][i]['tag']
            var type = json['songs'][i]['type']
            if(type == "online" && tag == videoId){
                json['songs'].splice([i],1)
                //break // idk
            }
        }
    }catch(e){
        config.error(e)
    }
    var last
    last = json['songs'].length
    json['songs'][last] = {"title" : videoTitle, "file" : videoTitle + ".mp3", "type" : "offline"}
    fs.writeFileSync(dir, JSON.stringify(json, null, 4), 'utf8')
    var songsCont = d.getElementById("songs-cont")
    if(songsCont){
        playlist.content.textContent = ""
        playlist.loadSongs()}

  });
  YD.on("error", function(error) {
    config.error(error);
    });
    YD.on("progress", function(progress) {
        console.log(JSON.stringify(progress));
    });
}
// playlist var
const playlistWindow = new PlaylistWindow()
// click event for playlist icon
d.getElementById("playlists").addEventListener("click", () => {
    playlistWindow.reload()
    playlistWindow.show()
})
class SongWindow{
    show(){
        var playlistH1 = d.createElement("div")
        this.content = d.createElement('div')
        content.textContent = ""

        playlistH1.classList.add("playlistH1")
        this.content.id = "songs-cont"
        playlistH1.textContent = this.playlist.getName()
        this.content.appendChild(playlistH1)
        content.appendChild(this.content)

        var songs = this.playlist.getSongs()

        songs.forEach(song => {
            var div = d.createElement('div')
            var p = d.createElement('p')
            var removeButton = d.createElement('div')
            var addButton = d.createElement('div')

            addButton.textContent = "+"
            removeButton.classList.add('removePlBtn')
            addButton.classList.add('addPlButton')
            addButton.classList.add('unselectable')
            div.classList.add('song')
            p.setAttribute('data-text', song.getName())
            div.appendChild(removeButton)
            div.appendChild(p)
            div.appendChild(addButton)
            
            div.addEventListener('click', (e) => {
                if(!(playlistWindow.clickTest(e.target))){ return}
                this.setSong(song)
                playSound()
            })
            removeButton.addEventListener('click', (e) => {
                e.preventDefault()
                var dir = `${config.playlistsPath}\\${this.playlist.getFile()}`
                var json = JSON.parse(fs.readFileSync(dir,'utf-8'))
                for(let i=0;i<json.songs.length;i++){
                    if ((json.songs[i].file == song.getFile()) && (json.songs[i].name == song.getName())){
                        json.songs.splice(i, 1)
                        break
                    }else if((json.songs[i].tag == song.getTag()) && (json.songs[i].name == song.getName())){
                        json.songs.splice(i, 1)
                        break
                    }
                }
                json = JSON.stringify(json, null, 4)
                fs.writeFileSync(dir, json, 'utf-8')
                this.playlist.reload()
                this.show()
            })
            addButton.addEventListener('click', (e) => {
                e.preventDefault()
                fileManager.addPlaylistArg(song.getName(), song.getFile(), null)
            })

            this.content.appendChild(div)
        })
    }
    setPlaylist(pl){
        this.playlist = pl
    }
    getPlaylist(){
        return this.playlist
    }
    setSong(song){
        var currentSong = d.getElementById("currentSongName")
        this.song = song
        currentSong.setAttribute("data-text", song.getName())
        currentTimeContainer.textContent = "0:00"
        currentTimeContainer.value = 0
        audio.src = `${config.songsPath}\\${song.getFile()}`
        audio.currentTime = 0
    }
    getSong(){
        return this.song
    }
    newSongCont(){
        var c = d.createElement('div')
        c.id = "songs-cont"
        this.content = c
        return this.content
    }
}
const songWindow = new SongWindow()