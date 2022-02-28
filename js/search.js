class Searcher{
  constructor(){
    this.content = d.getElementById("content")
    this.defaultJSON = JSON.stringify({
      "songs" : []
    }, null, 4)
  }
  
  load(){
    d.getElementById("search").style.color = "white"
    d.getElementById("search").style.backgroundColor = "#b3b3b331";
    d.getElementById("playlists").style.color = null
    d.getElementById("playlists").style.backgroundColor = null

    this.searchCont = d.getElementById('search-cont')
    if(this.searchCont){return}
    this.searchedCont = d.createElement("div")
    this.searchedCont.id = "searchedCont"
    this.content.textContent = ""


    // create Cont
    this.searchCont = d.createElement("div")
    this.searchCont.id = "search-cont"
    this.searchCont.style.width = "100%"
    this.searchCont.style.height = "100%"


    this.input = d.createElement("input")
    this.input.id = "searchInput"
    this.input.placeholder = language.search_for

    this.searchCont.appendChild(this.input)
    this.content.appendChild(this.searchCont)
    this.searchCont.appendChild(this.searchedCont)

    this.input.addEventListener("input", () => {
      waitTillStop()
    })
  }
  async search(){
    var value = this.input.value
    if(value == ""){ return }
    if(!(await test_internet())){
      config.error('Internet connection failed, please try again later!')
      return
    }
    this.searchedCont.textContent = ""

    var videos = await yt.search(value)
    videos.forEach(video => {
      var title = video['title']
      var id = video['id']['videoId']
      var thumbnail = video["snippet"]["thumbnails"]["high"]["url"]
      
      var newDiv = document.createElement("div");
      var newImg = document.createElement("img");
      var newP = document.createElement('p');
  
      newP.textContent = title;
      newP.classList.add('ytb-title')
  
      newImg.classList.add('ytb-img','unselectable');
  
      newImg.addEventListener('click', () => {console.log("Play online song")})
      newImg.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        fileManager.addPlaylistArg(title, null, id)
      }, false);
  
          newDiv.classList.add("searched")
          newImg.src = thumbnail;

          this.searchedCont.appendChild(newDiv)
          newDiv.appendChild(newImg)
          newDiv.appendChild(newP)
    })

  }
  openYoutubeSettings(index){
    var dict = {}
    dict["$new_pl"] = " > " + language.playlist_create_new
    for(let i=0;i<playlist.files.length;i++){
      var plName = path.parse(playlist.files[i]).name; 
      dict[plName] = plName
    }
  
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
          inputPlaceholder: "Ultimate playlist"
        }).then((result) => {
          if(!(result.value)) {return}
          // create new playlist
          this.createNewPl(result.value, index) 
        })
      }else{
        // append existing playlist
        this.appendPlaylist(result.value, index)
      }
    });
  }
  appendPlaylist(playlistName, index){
    var save = true
    var dir = config.playlistsPath + "\\" + playlistName + ".json"
    var data = fs.readFileSync(dir, 'utf8');
    var json = JSON.parse(data)
    if(typeof index == 'number'){
      var youtubeInfo = this.searchCont.getElementsByClassName("searched")[index]
      var ytbLink = youtubeInfo.getAttribute("link")
      var ytbTitle = youtubeInfo.getAttribute("title")
      var last = json["songs"].length
      json['songs'][last] = {"title" : ytbTitle, "tag" : ytbLink, "type" : "online"}
      fs.writeFileSync(dir, JSON.stringify(json, null, 4))
    }else{
      var file = index.getAttribute("file")
      var title = index.getAttribute("title")
      if(!(title)){title = path.parse(file).name}
      var last = json['songs'].length
      var isInPl = false
      for(let i=0;i<last;i++){
        var tempFile = json['songs'][i]['file']
        var type = json['songs'][i]['type']
        if(type == "offline" && tempFile == file){
          isInPl = true
          break
        }
      }
        if(isInPl){
          Swal.fire({
            title : language.song_already_in_playlist_title.replace("%song%", title),
            text : language.song_already_in_playlist_text,
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
            json['songs'][last] = {"title" : title, "file" : file, "type" : "offline"}
            fs.writeFileSync(dir, JSON.stringify(json, null, 4)) 
              }
            })
        }else{
          json['songs'][last] = {"title" : title, "file" : file, "type" : "offline"}
          fs.writeFileSync(dir, JSON.stringify(json, null, 4)) 
        }
    }
  }
  createNewPl(playlistName, index){
    var dir = config.playlistsPath + "\\" + playlistName + ".json"
    if(typeof index == 'number'){
      var json = JSON.parse(this.defaultJSON)
      var youtubeInfo = this.searchCont.getElementsByClassName("searched")[index]
      var ytbLink = youtubeInfo.getAttribute("link")
      var ytbTitle = youtubeInfo.getAttribute("title")
      json["songs"][0] = {"title" : ytbTitle, "tag" : ytbLink, "type" : "online"}

      json = JSON.stringify(json, null, 4)
      fs.writeFileSync(dir, json ,{encoding: 'utf8'})
    }else{
      var json = JSON.parse(this.defaultJSON)
      var file = index.getAttribute('file')
      var title = index.getAttribute("title")
      if(!(title)){title = path.parse(file).name}
      json["songs"][0] = {"title" : title, "file" : file, "type" : "offline"}
      json = JSON.stringify(json, null, 4)
      fs.writeFileSync(dir, json ,{encoding: 'utf8'})
    }
    playlist.reloadFiles()
  }

}
var searcher = new Searcher();

d.getElementById("search").addEventListener("click", () => searcher.load())

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
var waitTillStop = debounce(function() {
    searcher.search()
  }, 250);
