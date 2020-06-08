var EventCenter = {
  on: function(type, callback) {
    $(document).on(type, callback)
  },
  fire: function(type, data) {
    $(document).trigger(type, data)
  }
}
// EventCenter.on('clickAblum', function (e, data) {
//   console.log(data)
// })
// EventCenter.fire('clickAblum', 'rua')

var Footer = {
  init: function() {
    this.$footer = $('footer')
    this.$container = $('footer ul')
    this.$prev = $('footer .fa-angle-left')
    this.$next = $('footer .fa-angle-right')
    this.isToEnd = false
    this.isToStart = true
    this.left = 0
    this.getData()
    this.isbouncing = false //给最后弹性动画加锁，防止快速点击不断触发动画
    // this.bind() 应该在形成dom之后再bind，才能获取setstyle里面的参数
  },
  bind: function() {
    $(window).on(
      'resize',
      function() {
        this.setStyle()
      }.bind(this)
    )
    this.$footer.on('click', 'li', function() {
      $(this)
        .addClass('active')
        .siblings()
        .removeClass('active')
      EventCenter.fire('select-channel', {
        channelId: $(this)
          .find('div')
          .attr('data-channel-id'),
        channelName: $(this)
          .find('div')
          .attr('data-channel-name')
      })
    })
    this.$next.on(
      'click',
      function() {
        this.isToStart = false
        if (this.isToEnd) {
          if (this.isbouncing) return
          this.isbouncing = true
          this.$container
            .animate(
              {
                left: '-=5vh'
              },
              150
            )
            .animate(
              {
                left: '+=5vh'
              },
              50,
              function() {
                this.isbouncing = false
              }.bind(this)
            )
          return
        }
        if (
          -this.left + $('footer .channels').width() >
          this.$container.width()
        ) {
          this.isToEnd = true
          return
        }
        this.left -= this.rowCount * this.channelWidth
        this.$container.animate(
          {
            left: this.left
          },
          400
        )
      }.bind(this)
    )
    this.$prev.on(
      'click',
      function() {
        this.isToEnd = false
        if (this.isToStart) {
          if (this.isbouncing) return
          this.isbouncing = true
          this.$container
            .animate(
              {
                left: '+=5vh'
              },
              150
            )
            .animate(
              {
                left: '-=5vh'
              },
              50,
              function() {
                this.isbouncing = false
              }.bind(this)
            )
          return
        }
        if (this.left + 10 > 0) {
          this.isToStart = true
          return
        }
        this.left += this.rowCount * this.channelWidth
        this.$container.animate(
          {
            left: this.left
          },
          400
        )
      }.bind(this)
    )
  },
  getData: function() {
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/v2/getChannels.php')
      .done(function(ret) {
        console.log(ret)
        _this.render(ret.channels)
      })
      .fail(function() {
        console.log('error')
      })
  },
  render: function(channels) {
    var html = ''
    channels.forEach(function(channel) {
      html += `
      <li>
        <div
          class="cover" data-channel-id ="${
            channel.channel_id
          }" data-channel-name ="${channel.name}" style="background-image:url(${
        channel.cover_small
      })"
        ></div>
        <h3>${channel.name}</h3>
      </li>
      `
    })
    $('footer .layout ul').append(html)
    this.setStyle()
    this.bind()
  },
  setStyle: function() {
    this.$channels = $('footer').find('li')
    this.$channels.eq(0).addClass('active')
    this.channelWidth = this.$channels.outerWidth(true)
    var count = this.$channels.length
    this.$container.css('width', count * this.channelWidth)
    this.rowCount = Math.floor(
      $('footer .channels').width() / this.channelWidth
    )
    console.log('rowCount' + this.rowCount)
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var Fm = {
  init: function() {
    this.$container = $('main.layout')
    this.$playBtn = this.$container.find('.btn-play')
    this.$nextBtn = this.$container.find('.btn-next')
    this.$heartBtn = this.$container.find('.btn-heart')
    this.channel = {
      channelId: 'public_shiguang_80hou',
      channelName: '80后'
    }
    this.audio = new Audio()
    this.audio.autoplay = true
    this.bind()
    this.loadMusic(this.setMusic)
  },
  bind: function() {
    var _this = this
    EventCenter.on(
      'select-channel',
      function(e, data) {
        console.log('data', data)
        this.channel = data
        this.loadMusic(this.setMusic)
      }.bind(this)
    )
    console.log(this.$playBtn)

    // 三个按钮
    this.$playBtn.on(
      'click',
      function() {
        if (this.audio.paused == true) {
          this.audio.play()
          return
        }
        this.audio.pause()
      }.bind(this)
    )
    this.$nextBtn.on(
      'click',
      function() {
        this.loadMusic(this.setMusic)
      }.bind(this)
    )
    this.$heartBtn.on(
      'click',function () {
        $(this).toggleClass('active')
      }
    )
    // 进度条
    $('.progress .bar').on(
      'click',
      function(e) {
        // console.log(e.offsetX)
        if (this.audio.paused === true) {
          this.audio.play()
        }
        var percent = e.offsetX / parseInt($('.progress .bar').width())
        this.audio.currentTime = this.audio.duration * percent
        this.updateStatus()
      }.bind(this)
    )

    //audio相关绑定
    this.audio.onplay = function() {
      // console.log(this)
      clearInterval(_this.clock)
      _this.clock = setInterval(function() {
        _this.updateStatus()
      }, 1000)
      _this.$playBtn.removeClass('fa-play').addClass('fa-pause')
    }
    this.audio.onpause = function() {
      clearInterval(_this.clock)
      _this.$playBtn.removeClass('fa-pause').addClass('fa-play')
    }
    // this.audio.ontimeupdate = function() {
    //   // console.log(this.currentTime)
    //   $('.progress .bar-now').css(
    //     'width',
    //     (this.currentTime / this.duration) * 100 + '%'
    //   )
    // }
    this.audio.onended = function() {
      this.loadMusic(this.setMusic)
    }.bind(this)
  },
  loadMusic(callback) {
    var _this = this
    // console.log('loading')
    $.getJSON('//jirenguapi.applinzi.com/fm/v2/getSong.php', {
      channel: this.channel.channelId
    }).done(function(ret) {
      _this.song = ret.song[0]
      console.log(ret)
      // console.log(_this.song)
      callback.bind(_this)()
    })
  },
  loadLyrics() {
    var _this = this
    // console.log('loading')
    $.getJSON('//jirenguapi.applinzi.com/fm/v2/getLyric.php', {
      sid: this.song.sid
    }).done(function(ret) {
      // console.log(ret)
      var lyrics = ret.lyric
      window.lyrics = lyrics
      var lyricsObj = {}
      lyrics.split('\n').forEach(function(line) {
        var times = line.match(/\d{2}:\d{2}/g)
        var str = line.replace(/\[.+?]/g, '')
        if (Array.isArray(times)) {
          times.forEach(function(time) {
            lyricsObj[time] = str
          })
        }
      })
      _this.lyricsObj = lyricsObj
      console.log(_this.lyricsObj)
    })
  },
  setMusic() {
    this.audio.src = this.song.url
    $('.bg').css('background-image', `url(${this.song.picture})`)
    // console.log(this.$container.find('figure'))
    this.$container
      .find('figure')
      .css('background-image', `url(${this.song.picture})`)
    this.$container.find('h2').text(this.song.title)
    this.$container.find('.singer').text(this.song.artist)
    this.$container.find('.channel span').text(this.channel.channelName)
    this.loadLyrics()
  },
  updateStatus() {
    var formatedTime = this.formatTime(this.audio.currentTime)
    $('.progress .time-now').text(formatedTime)
    $('.progress .bar-now').css(
      'width',
      (this.audio.currentTime / this.audio.duration) * 100 + '%'
    )
    // 歌词功能和特效
    if (this.lyricsObj[formatedTime] && formatedTime != '00:00') {
      // console.log(this.lyricsObj[formatedTime])
      this.$container
        .find('.lyrics')
        .text(this.lyricsObj[formatedTime])
        .animateText()
    }
  },
  formatTime(time) {
    return (
      Math.floor(time / 60)
        .toString()
        .padStart(2, 0) +
      ':' +
      Math.floor(time % 60)
        .toString()
        .padStart(2, 0)
    )
  }
}

// jq动画插件
$.fn.animateText = function(type) {
  type = type || 'rollIn'
  this.html(function() {
    var arr = $(this)
      .text()
      .split('')
      .map(function(word) {
        return `<span  style="opacity:0;display:inline-block">${word}</span>`
      })
    return arr.join('')
  })

  var index = 0
  var $texts = $(this).find('span')
  var clock = setInterval(function() {
    $texts.eq(index).addClass('animated ' + type)
    index++
    if (index >= $texts.length) {
      clearInterval(clock)
    }
  }, 200)
}
$('p').animateText()

Footer.init()
Fm.init()
