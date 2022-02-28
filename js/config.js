const Swal = require('sweetalert2')
const ipc = require('electron').ipcRenderer
const fs = require('fs');
const path = require('path');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const yt = require('youtube-search-without-api-key');
const child = require('child_process')
var d = document
var content = d.getElementById("content")


class Config{
    constructor(){
        this.configPath = __dirname + "\\config.json"
        this.defaultJSON = JSON.stringify({
            songsPath : "%dirname%\\songs",
            playlistsPath : "%dirname%\\playlists",
            ffmpegPath : "%dirname%\\ffmpeg\\ffmpeg.exe",
            volume : 100,
            currentSong : null,
            currentSongTitle : null,
            loop : 0,
            random : 0,
            currentLang : "%dirname%\\lang\\en.json"
        }, null, 4)
    }

    fileExists(path){
        try {
            if (fs.existsSync(path)) {
              return true
            }else{
                return false
            }
          } catch(err) {
            return false
          }
    }
    error(err){
        Swal.fire({
            title: 'Error!',
            text: err,
            icon: 'error',
            confirmButtonText: 'Ok',
            confirmButtonColor: "#F27474",
            background: "#181818",
            color: 'white'
        })
    }
    writeDefaultConfig(){
        fs.writeFileSync(this.configPath, this.defaultJSON, (error) => {
            if(error) {this.error(error);}
        })
    }
    loadConfig(){
        var data = fs.readFileSync(this.configPath, 'utf8')
        var json = JSON.parse(data);
        this.playlistsPath = json['playlistsPath'].replace("%dirname%", __dirname)
        this.songsPath = json['songsPath'].replace("%dirname%", __dirname)
        this.volume = json['volume']
        this.loop = json['loop']
        this.random = json['random']
        this.currentSong = json['currentSong']
        this.currentSongTitle = json['currentSongTitle']
        this.ffmpeg = json['ffmpegPath'].replace("%dirname%", __dirname)
        this.currentLang = json['currentLang'].replace("%dirname%", __dirname)
    }
    saveConfig(){
        var data = fs.readFileSync(this.configPath, 'utf8');
        var json = JSON.parse(data)

        json['volume'] = Number(volumeSlider.value)
        json['loop'] = loopState
        json['currentSong'] = playlist.currentSong
        json['currentSongTitle'] = playlist.currentSongTitle
        json['random'] = randomState
        
        fs.writeFileSync(this.configPath, JSON.stringify(json, null, 4))
    } 
}
var config = new Config();

window.addEventListener('load', () => {
    // load config
    if(!(config.fileExists(config.configPath))){
        config.writeDefaultConfig()
    }
    config.loadConfig()
    // load language
    language.load()
    
    if(!(fs.existsSync(config.songsPath))){
        fs.mkdirSync(config.songsPath)
    }if(!(fs.existsSync(config.playlistsPath))){
        fs.mkdirSync(config.playlistsPath)
    }

    // loop settings
    if(config.loop && Number.isInteger(config.loop)){
        changeLoop(config.loop)
    }else{
        changeLoop(0)
    }
    // random player settings
    if(config.random && Number.isInteger(config.random)){
        changeRandom(config.random)
    }else{
        changeRandom(0)
    }

    // volume settings
    if(Number.isInteger(config.volume) && config.volume >= 0 && config.volume <= 100){
        volumeSlider.value = config.volume
    }else{
        volumeSlider.value = 100
    }
    // set current song
    /*if(config.currentSong){
        playlist.setCurrentSong(config.currentSong, config.currentSongTitle)
    }*/

    changeVolume()
    // load window
    playlistWindow.reload()
    playlistWindow.show()
})

d.getElementById("closeBtn").addEventListener("click", function() {
    //config.saveConfig()
    ipc.send('close')
});
d.getElementById("minBtn").addEventListener("click", function() {ipc.send('min')});
d.getElementById("maxBtn").addEventListener("click", function() {ipc.send('max')});


async function test_internet() {
    var internet
    try{
        await fetch('https://static-global-s-msn-com.akamaized.net/hp-neu/sc/2b/a5ea21.ico?d='+Date.now()).then(response => {
            if (response.ok){
                internet = true
            }else{
                internet = false
            }
        })
    }catch{
        internet = false
    }
  return internet
  }


ipc.once('save', () => {
    config.saveConfig()
})
// if space is pressed => play or pause song
window.addEventListener("keydown", (e) => {
    // if user is in input
    if(searcher.input == document.activeElement) {return}
    // if key is Space
    if(e.key == " "){
        // play or pause video
        playPauseIconClicked()
    }
})



class Language{
    load(){
        var json = fs.readFileSync(config.currentLang, 'utf-8')
        json = JSON.parse(json)
        this.playlists = json['playlists']
        this.search = json['search']
        this.search_for = json['search_for']
        this.song_download = json['song_download']
        this.song_already_in_playlist_title = json['song_already_in_playlist_title']
        this.song_already_in_playlist_text = json['song_already_in_playlist_text']
        this.playlist_remove_text = json['playlist_remove_text']
        this.playlist_remove_title = json['playlist_remove_title']
        this.playlist_create_new = json['playlist_create_new']
        this.playlist_add = json['playlist_add']
        this.playlist_name = json['playlist_name']
        this.songs_not_found = json['songs_not_found'].split(";")
        this.success = json['success']
        this.downloading = json['downloading']
        this.no = json['no']
        this.yes = json['yes']
        this.local_storage = json['local_storage']
        this.message = json['message']
        this.playlistPH = json.playlistPH
        this.playlist_already_exists = json.playlist_already_exists
        this.playlist_already_exists_text = json.playlist_already_exists_text


        d.getElementById("search").setAttribute("data-text", "⌕ " + this.search)
        d.getElementById("playlists").setAttribute("data-text", "⌂ " +  this.playlists)
    }
}
var language = new Language();