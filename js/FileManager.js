class FileManager{
    constructor(){
        this.defaultJSON = {
            name : {},
            songs : []
        } 
    }
    fileExists(file){
        try {
            if (fs.existsSync(file)) {
                return true
            }else{
                return false
            }
            } catch(err) {
                return false
            }
    }

    addPlaylistArg(name, file, tag){
        var dict = {}
        dict["$new_pl"] = " > " + language.playlist_create_new
        
        playlists.getList().forEach(pl => {
            dict[pl.getFile()] = pl.getName()
        })

        var inputOptionsPromise = new Promise(function (resolve) {
          setTimeout(function () {
            resolve(dict)
          }, 100)
          
        })
        Swal.fire({
          title: language.playlist_add,
          confirmButtonColor: "#1DB954",
          background: "#181818",
          color: 'white',
          input: 'select',
          inputOptions: inputOptionsPromise
        }).then((result) => {
          if (!(result.value)) {return}
          if(result.value == "$new_pl"){
            Swal.fire({
              title : language.playlist_name,
              input: "text",
              background: "#181818",
              color: 'white',
              inputPlaceholder: language.playlistPH
            }).then((result) => {
              if(!(result.value)) {return}
              var plResult = result.value
              if(this.fileExists(`${config.playlistsPath}\\${result.value}.json`)){
                Swal.fire({
                    title : language.playlist_already_exists,
                    text : language.playlist_already_exists_text,
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: language.yes,
                    denyButtonText: language.no,
                    confirmButtonColor: "#1DCF5C",
                    denyButtonColor: "#F27474",
                    background: "#181818",
                    color: 'white'
                }).then((result) => {
                    if(result.isConfirmed){
                        this.createNewPlaylist(name, file, tag, plResult)
                        }
                    })
              }else{
                this.createNewPlaylist(name, file, tag, plResult)
              }
            })
          }else{
            // append existing playlist
            this.appendPlaylist(name, file, tag, result.value)
          }
        });
    }

    createNewPlaylist(songName, songFile, songTag, plName){
        var json = this.defaultJSON
        var dir = `${config.playlistsPath}\\${plName}.json`
        json.name = plName
        if(songName){
            json.songs[0] = {'name' : songName, 'file' : songFile, 'tag' : songTag}
        }
        fs.writeFileSync(dir, JSON.stringify(json, null, 4))

    }
}

const fileManager = new FileManager()