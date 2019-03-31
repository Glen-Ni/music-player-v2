# 音乐电台
> [预览链接](https://glen-ni.github.io/music-player-v2/)

## 功能简介
  - 主要适配横屏、全屏的响应式音乐电台播放器
  - 基本音乐播放和控制
  - 电台频道列表
  - 歌词及歌词特效
  - 施工中···
    + 收藏功能(用localStorage) 
  
## 细节
  - 使用jquery，组件化，面向对象
  - 使用EventCenter来进行频道与播放界面两个组件的数据传输
  - 由于适配宽屏，所以元素宽高主要用vh
  - channel列表左右切换没有直接加锁，使得切换依旧可以快速点击
  - 添加左右切换到底后的弹性效果动画，并加锁，防止快速点击重复播放动画
  - 不用audio.onontimeupdate来更新状态，因为他不够连续。这里用setinterval更新状态，并在进度条上加上transition，使得进度条动画更连续。
  - 歌词特效写成jq插件，方便使用，动画特效借用[animate.css](https://daneden.github.io/animate.css/)

## 遇到问题
  - 前进后退键搞反，搞了很久
  - $('container')类选择器经常少一`.`
  - $node.addClass('.active')有次多了个点，debug了好久，淦
  - 由于播放列表dom是由ajax返回后拼接成，所以响应式设置其样式和绑定事件要在特定的位置，而不能放在开头
  - $node.width()是数字, $node.css('width')带单位 需要parseFloat一下
  - 歌词处理用正则，`str.match(//g)`要加g才能生成数组方便遍历。如果没有match到返回null，要剔除这种情况再遍历
  
## 收获
  - 对项目要求和如何实现的思考更加清晰
  - jq操作更娴熟
  - Audio对象操作更加熟练