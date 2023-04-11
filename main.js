// Music player
/*
    1. Render songs
    2. Scroll too
    3. Play / pause /seek
    4. CD rotate
    5. Next / Prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// constants => capitalization
const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')

const progress = $('#progress')
const timeCurrent = $('.progress-time__current')
const timeDuration = $('.progress-time__duration')

const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const playlist = $('.playlist')

const app = {
  currentIndex: 0,
  newSongs: [],
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: 'Heroes-Tonight',
      singer: 'Janji-Johnning',
      path: './assets/music/Heroes-Tonight-Janji-Johnning.mp3',
      img: './assets/img/herostonight.jpg',
    },
    {
      name: 'Monody',
      singer: 'TheFatRat',
      path: './assets/music/Monody-TheFatRat-Laura-Brehm.mp3',
      img: './assets/img/monody.jpg',
    },
    {
      name: 'Nevada',
      singer: 'Vinetone',
      path: './assets/music/Nevada-Vicetone-Cozi-Zuehlsdorff.mp3',
      img: './assets/img/nevadavicetone.jpg',
    },
    {
      name: 'On my way',
      singer: 'Alan-Walker',
      path: './assets/music/On-My-Way-Alan-Walker-Sabrina-Carpenter-Farruko.mp3',
      img: './assets/img/onmyway.jpg',
    },
    {
      name: 'Play',
      singer: 'K-391',
      path: './assets/music/Play-K-391-Alan-Walker-Martin-Tungev.mp3',
      img: './assets/img/play.jpg',
    },
    {
      name: 'Reality',
      singer: 'Janieck-Devy',
      path: './assets/music/Reality-Lost-Frequencies-Janieck-Devy.mp3',
      img: './assets/img/reality-lost.jpg',
    },
    {
      name: 'Something Just Like This',
      singer: 'The Chainsmokers',
      path: './assets/music/Something-Just-Like-This-The-Chainsmokers-Coldplay.mp3',
      img: './assets/img/sometimesjustlikethis.jpg',
    },
    {
      name: 'Spectre',
      singer: 'Alan',
      path: './assets/music/Spectre-Alan-Walker.mp3',
      img: './assets/img/spectre-alanwaker.jpg',
    },
    {
      name: 'Summertime',
      singer: 'K-391',
      path: './assets/music/Summertime-K-391.mp3',
      img: './assets/img/summertime.jpg',
    },
    {
      name: 'Unity',
      singer: 'TheFatRat',
      path: './assets/music/Unity-TheFatRat.mp3',
      img: './assets/img/unity-thefatrat.jpg',
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
              <div class="song ${
                index === this.currentIndex ? 'active' : ''
              }" data-index="${index}">
                <div
                    class="thumb"
                    style="
                        background-image: url('${song.img}');
                    "
                ></div>

                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>

                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
 
              </div>
          `
    })
    playlist.innerHTML = htmls.join('\n')
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex]
      },
    })
  },
  handleEvents: function () {
    const _this = this //app

    //width of image on CD
    const cdWidth = cd.offsetWidth

    // Handle CD spins / stops
    const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
      duration: 10000, //10 seconds
      interations: Infinity,
    })
    cdThumbAnimate.pause()

    //handle zooming
    document.onscroll = function () {
      //height of the window
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      //new width of CD is decreasing with a condition that width > 0
      const newCdWidth = cdWidth - scrollTop
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
      cd.style.opacity = newCdWidth / cdWidth
    }

    //handling when click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }

    // When a song is played
    audio.onplay = function () {
      _this.isPlaying = true
      player.classList.add('playing')
      cdThumbAnimate.play()
    }

    // When a song is paused
    audio.onpause = function () {
      _this.isPlaying = false
      player.classList.remove('playing')
      cdThumbAnimate.pause()
    }

    // when the song tempo changes
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        )
        progress.value = progressPercent
        timeDuration.innerText = _this.timeFormat(audio.duration)
        timeCurrent.innerText = _this.timeFormat(audio.currentTime)
      }
    }

    // When a song is seeked
    progress.oninput = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value
      audio.currentTime = seekTime
    }

    //Next a song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.nextSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    //Prev a song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.prevSong()
      }
      _this.render()
      audio.play()
      _this.scrollToActiveSong()
    }

    //random a song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    //repeat a song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    //handle next song after audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()
      }
    }

    //listen to playlist click behavior: click to a song and play it
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)')
      const optionNode = e.target.closest('.option')
      if (songNode || optionNode) {
        // handle when click on a song  => play that song
        if (songNode) {
          //get data-index of clicked song
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }
        //handle when click on option of a song => show ...
        if (optionNode) {
        }
      }
    }
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 300)
  },
  timeFormat(seconds) {
    let minute = Math.floor(seconds / 60)
    let second = Math.floor(seconds % 60)
    minute = minute < 10 ? '0' + minute : minute
    second = second < 10 ? '0' + second : second
    return minute + ':' + second
  },
  loadCurrentSong: function () {
    // console.log(heading, cdThumb, audio);

    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
    audio.src = this.currentSong.path
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat

    // Object.assign(this, this.config);
  },
  compareSong: function () {
    let isCorrect = this.newSongs.every(function (song) {
      return song.name !== app.songs[app.currentIndex].name
    })
    if (isCorrect) {
      this.newSongs.push(this.currentSong)
    }
    if (this.newSongs.length === this.songs.length)
      this.newSongs = [this.currentSong]
  },
  nextSong: function () {
    this.compareSong()
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },
  prevSong: function () {
    this.compareSong()
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },
  playRandomSong: function () {
    this.compareSong()
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
      isCorrect = this.newSongs.every(function (song) {
        return song.name !== app.songs[newIndex].name
      })
    } while (!isCorrect)

    this.currentIndex = newIndex
    this.loadCurrentSong()
  },
  start: function () {
    //assign configuration from config to app object - gán cấu hình từ config vào ứng dụng
    this.loadConfig()

    //Define properties for object: app.currentSong
    this.defineProperties()

    //Listen and handle events
    this.handleEvents()

    //Download all info of the first song into UI when the app plays
    this.loadCurrentSong()

    //Render playlist
    this.render()

    //Hien thi trang thai ban dau cua button repeat va random
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)
  },
}

app.start()
