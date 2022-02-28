let raf = null;
let whilePlaying
let playState
let muteState
let loopState
let randomState

var audioPlayerContainer
var playIconContainer
var seekSlider
var volumeSlider
var muteIconContainer
var audio
var durationContainer
var currentTimeContainer
var loopIconContainer
let randomIconContainer

var showRangeProgress
var changeVolume
var playPauseIconClicked

class AudioPlayer extends HTMLElement {
    constructor() {
        super();
        const template = document.querySelector('template');
        const templateContent = template.content;
        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(templateContent.cloneNode(true));
    }

    connectedCallback() {
        everything(this);
    }

}

const everything = function(element) {  
    const shadow = element.shadowRoot;

    audioPlayerContainer = shadow.getElementById('audio-player-container');
    playIconContainer = shadow.getElementById('play-icon');
    randomIconContainer = shadow.getElementById('random-icon')
    seekSlider = shadow.getElementById('seek-slider');
    volumeSlider = shadow.getElementById('volume-slider');
    muteIconContainer = shadow.getElementById('mute-icon');
    audio = shadow.querySelector('audio');
    durationContainer = shadow.getElementById('duration');
    currentTimeContainer = shadow.getElementById('current-time');
    loopIconContainer = shadow.getElementById('loop-icon');
    

    playState = 'play';
    muteState = 'unmute';
    let beforeMute = null
    loopState = 0

    whilePlaying = () => {
        seekSlider.value = Math.floor(audio.currentTime);
        currentTimeContainer.textContent = calculateTime(seekSlider.value);
        audioPlayerContainer.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
        raf = requestAnimationFrame(whilePlaying);
    }

    showRangeProgress = (rangeInput) => {
        if(rangeInput === seekSlider) audioPlayerContainer.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
        else audioPlayerContainer.style.setProperty('--volume-before-width', rangeInput.value / rangeInput.max * 100 + '%');
        audio.volume = rangeInput.value / 400
    }

    const calculateTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${returnedSeconds}`;
    }
        
    const displayDuration = () => {
        durationContainer.textContent = calculateTime(audio.duration);
    }
        
    const setSliderMax = () => {
        seekSlider.max = Math.floor(audio.duration);
    }
        
    const displayBufferedAmount = () => {
        const bufferedAmount = Math.floor(audio.buffered.end(audio.buffered.length - 1));
        audioPlayerContainer.style.setProperty('--buffered-width', `${(bufferedAmount / seekSlider.max) * 100}%`);
    }

    if (audio.readyState > 0) {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
    } else {
        audio.addEventListener('loadedmetadata', () => {
            displayDuration();
            setSliderMax();
            displayBufferedAmount();
        });
    }

    playIconContainer.addEventListener('click', () => {playPauseIconClicked()})

    playPauseIconClicked = () => {
        if(audio.src == "file://" + window.location.pathname){
            config.error("Song not found!")
            return
        }
        if(playState === 'play') {
            audio.play();
            playIconContainer.src = "images/pause.png"
            requestAnimationFrame(whilePlaying);
            playState = 'pause';
        } else {
            audio.pause();
            playIconContainer.src = "images/play.png"
            cancelAnimationFrame(raf);
            playState = 'play';
        }
    };
        
    muteIconContainer.addEventListener('click', () => {
        if(muteState === 'unmute') {
            beforeMute = volumeSlider.value
            volumeSlider.value = 0
            changeVolume()
        } else {
            if(beforeMute){ volumeSlider.value = beforeMute}
            changeVolume()
        }
    });

    audio.addEventListener('progress', displayBufferedAmount);

    seekSlider.addEventListener('input', (e) => {
        showRangeProgress(e.target);
        currentTimeContainer.textContent = calculateTime(seekSlider.value);
        if(!audio.paused) {
            cancelAnimationFrame(raf);
        }
    });

    seekSlider.addEventListener('change', () => {
        audio.currentTime = seekSlider.value;
        if(!audio.paused) {
            requestAnimationFrame(whilePlaying);
        }
    });

    volumeSlider.addEventListener('input', () => {changeVolume()})

    changeVolume = () => {
        const value = volumeSlider.value
        
        if(value==0){
            muteIconContainer.src = "images/muted.png"
            audio.muted = true;
            muteState = 'mute';
        }
        else{
            beforeMute = value
        }
        if (value > 0 && value <= 35){
            muteIconContainer.src = "images/unmuted-1.png"
            audio.muted = false;
            muteState = 'unmute';
        } else if(value > 35 && value <= 75){
            muteIconContainer.src = "images/unmuted-2.png"
            audio.muted = false;
            muteState = 'unmute';
        }else if(value > 75){
            muteIconContainer.src = "images/unmuted-3.png"
            audio.muted = false;
            muteState = 'unmute';
        }
        
        showRangeProgress(volumeSlider);
        
    }
    loopIconContainer.addEventListener('click', () => {
        loopState++
        if(loopState>2){loopState=0}
        loopIconContainer.textContent = loopState

        if(loopState == 0){
            audio.removeAttribute('loop')
            loopIconContainer.src = "images/loop_unactive.png"
        }else if(loopState == 1)
        {
            audio.removeAttribute('loop')
            loopIconContainer.src = "images/loop_active.png"
        }else{ 
            audio.setAttribute('loop','true')
            loopIconContainer.src = "images/loop_active_only.png"
        }

    })
    randomIconContainer.addEventListener("click", () => {
        if(randomState == 0){
            changeRandom(1)
        }else{
            changeRandom(0)
        }
    })

    if('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Youtify'
        });
        navigator.mediaSession.setActionHandler('play', () => {
            if(playState === 'play') {
                audio.play();
                
                requestAnimationFrame(whilePlaying);
                playState = 'pause';
            } else {
                audio.pause();
                
                cancelAnimationFrame(raf);
                playState = 'play';
            }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if(playState === 'play') {
                audio.play();
                
                requestAnimationFrame(whilePlaying);
                playState = 'pause';
            } else {
                audio.pause();
                cancelAnimationFrame(raf);
                playState = 'play';
            }
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            audio.currentTime = audio.currentTime - (details.seekOffset || 10);
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            audio.currentTime = audio.currentTime + (details.seekOffset || 10);
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.fastSeek && 'fastSeek' in audio) {
              audio.fastSeek(details.seekTime);
              return;
            }
            audio.currentTime = details.seekTime;
        });
        navigator.mediaSession.setActionHandler('stop', () => {
            audio.currentTime = 0;
            seekSlider.value = 0;
            audioPlayerContainer.style.setProperty('--seek-before-width', '0%');
            currentTimeContainer.textContent = '0:00';
            if(playState === 'pause') {
                
                cancelAnimationFrame(raf);
                playState = 'play';
            }
        });
    }
}

customElements.define('audio-player', AudioPlayer);


var ap = document.querySelector('audio-player')
var shadow = ap.shadowRoot
var shadowDiv = shadow.childNodes[3]


function playSound(){
    playIconContainer.src = "images/pause.png"
    playState = "pause"
    audio.play()
    requestAnimationFrame(whilePlaying)
}
function stopSound(){
    playState = "play"
    playIconContainer.src = "images/play.png"
    audio.pause()
    cancelAnimationFrame(raf)
}

function changeLoop(state){
    loopState = state
    if(loopState == 0){
        audio.removeAttribute('loop')
        loopIconContainer.src = "images/loop_unactive.png"
    }else if(loopState == 1)
    {
        audio.removeAttribute('loop')
        loopIconContainer.src = "images/loop_active.png"
    }else{ 
        audio.setAttribute('loop','true')
        loopIconContainer.src = "images/loop_active_only.png"
    }
}

function changeRandom(state){
    randomState = state
    if(randomState == 0){
        randomIconContainer.src = "images/random_unactive.png"
    }else{
        randomIconContainer.src = "images/random_active.png"
    }
}

audio.addEventListener("ended", () => {
    if(loopState != 1){return}
    var index
    // if loop state is 0, do nothing because - no repeat
    // if loop state is 2, do nothing because the automatic built in loop (already declared)
    if(randomState == 0){
        playlist.playingSongsIndex += 1
        if(playlist.playingSongs.length <= playlist.playingSongsIndex){
            playlist.playingSongsIndex = 0
        }
        index = playlist.playingSongsIndex
        
    }else{
        index = Math.floor(Math.random() * playlist.playingSongs.length);
    }
    
    playlist.setCurrentSong(playlist.playingSongs[index]['file'], playlist.playingSongs[index]['title'])
    playSound()
})
function changeState(state){
    return state ? false : true
}