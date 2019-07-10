<template>
    <div id="home">
        <div class="carousel-box" v-loading="banner.loading" :class="{'hide': banner.complete && !banner.list.length}">
            <carousel-3d v-show="banner.list.length" class="carousel" :space="450" :perspective="0" :display="3" :width="850" :height="350" :autoplay="true" :autoplayHoverPause="true" :autoplayTimeout="3000" :border="0" :controls-visible="true" :controls-width="30" :controls-height="60">
                <slide v-for="(banner,index) in banner.list" :key="index" :index="index" :style="{backgroundImage: 'url(\''+ banner.image_url +'\')'}">
                    <a v-if="banner.go_url_web" :href="banner.go_url_web.indexOf('famulei.com') != -1 ? fmlUrl(banner.go_url_web, member, true) : banner.go_url_web" target="_blank"></a>
                </slide>
            </carousel-3d>
        </div>
        <div class="room-wrap container">
            <div class="room-hall clearfix">
                <div class="actions">
                    <div>
                        <router-link to="/room/match">
                            <img src="/static/image/room-solo.png"/>
                            <div class="label">Solo匹配</div>
                            <div class="desc">{{room.matching_count}} 人正在匹配</div>
                        </router-link>
                    </div>
                    <div class="custom" :class="{'join-show': custom.joinShow}">
                        <img src="/static/image/room-custom.png"/>
                        <div class="label">好友乱斗</div>
                        <div class="desc">创建 / 加入</div>
                        <div class="buttons">
                            <el-button @click="toCustom">创建房间</el-button>
                            <el-button @click="joinCustomRoom">加入房间</el-button>
                        </div>
                        <div class="join-room-box">
                            <div class="room-number-box">
                                <div class="room-number">
                                    <span class="text fl">输入房间号 :</span>
                                    <div class="input-box fl">
                                        <div class="num-box">
                                            <span v-for="(num,index) in custom.roomCode" :key="index" class="box" @click="custom.codeFocus = true" :class="{'hide': index == 5 && num}">{{num}}</span>
                                        </div>
                                        <input @keydown.delete="keyDownEvent($event)" v-model="custom.code" v-focus="custom.codeFocus" min="0" max="9" maxlength="1" :style="{left: custom.codeIndex * 36 + 'px'}" />
                                    </div>
                                </div>
                                <div class="buttons">
                                    <el-button @click="requestCustom" type="primary">确认</el-button>
                                    <el-button @click="custom.joinShow = false">取消</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="filter">
                    <div class="btn" :class="[{'active': room.params.type == item.value},{'disabled': room.loading}]" @click="filterBtnHandle(item)" v-for="(item,index) in filter" :key="index">{{item.label}}</div>
                </div>
                <div class="price">
                    <lfl-icon icon="price-bg" class="bg"></lfl-icon>
                    <div class="info">
                        <div class="key">
                            <div class="fl">共有房间</div>
                            <div class="fr">距离最近一场开始还剩</div>
                            <div class="clearfix"></div>
                        </div>
                        <div class="val">
                            <div class="fl">{{info.roomTotal}}</div>
                            <div class="fr">{{info.endTimeStr}}</div>
                            <div class="clearfix"></div>
                        </div>
                    </div>
                    <div class="range">
                        <span class="tickets fl">{{slider.value[0]}}</span>
                        <span class="tickets fr">{{slider.value[1]}}</span>
                    </div>
                    <div class="slider">
                        <vue-slider ref="slider" v-bind="slider" :clickable="false" v-model="slider.value" :disabled="room.loading" @drag-end="dragEndHandle"></vue-slider>
                    </div>
                </div>
            </div>
            <lfl-room-list :data="room" @loadingMore="loadingMore" v-loading="room.loading" element-loading-text="拼命加载中"></lfl-room-list>
        </div>
        <lfl-footer></lfl-footer>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                custom: {
                    joinShow: false,
                    roomCode: ['', '', '', '', '', ''],
                    codeIndex: -1,
                    codeFocus: false,
                    code: ''
                },
                room: {
                    matching_count: '-',
                    type: 'room',
                    params: {
                        type: 0,
                        min_price: 0,
                        max_price: 200,
                        limit: 40,
                        is_full_hide: 1,
                        page: 1
                    },
                    pageTotal: 0,
                    count: 0,
                    list: [],
                    loading: false
                },
                banner: {
                    list: [],
                    loading: false,
                    complete: false
                },
                filter: [
                    {label: '推荐', value: 0},
                    {label: '新手房', value: 1},
                    {label: '活动房', value: 2},
                    {label: '日赛房', value: 3},
                    {label: '周赛房', value: 4},
                    {label: 'SOLO房', value: 5},
                    {label: '名人房', value: 6},
                    {label: '毒奶房', value: 7}
                ],
                slider: {
                    value: [0, 200],
                    height: 6,
                    dotSize: 18,
                    min: 0,
                    max: 200,
                    tooltip: false,
                    bgStyle: {
                        "backgroundColor": "#E7EDF1",
                        "boxShadow": "inset 0 1px 0 0 rgba(0,0,0,0.06)",
                        "border-radius": "8px"
                    },
                    processStyle: {
                        "backgroundColor": "#0C9DFC",
                    }
                },
                endTime: 0,
                countDownInterval: null,
                info: {
                    roomTotal: '-',
                    endTimeStr: '-- : -- : --',
                    time: '',
                    endTime: ''
                },
                isMounted: false,
                priceChange: false
            }
        },
        computed: {
            member () {
                return this.$store.state.member
            }
        },
        watch: {
            '$store.state.member.token'() {
                this.requestRoomList()
            },
            'room.params': {
                handler(params) {
//                    this.$router.replace({path: '', params: params})
                    this.priceChange = params.min_price != 0 || params.max_price != 200
                    this.requestRoomList()
                },
                deep: true
            },
            '$route.query': {
                handler(data) {
                    this.requestRoomList()
                },
                deep: true
            },
            'room.params.type'() {
                this.room.params.page = 1
            },
            'room.params.min_price'(val) {
                this.room.params.page = 1
            },
            'room.params.max_price'(val) {
                this.room.params.page = 1
            },
            'info.time'(val) {
                let _this = this
                let targetDate = this.moment(val, 'X')
                let now = this.moment()
                this.info.endTime = targetDate.diff(now, 'seconds')
                _this.countDown(val)

                if (_this.countDownInterval) {
                    clearInterval(_this.countDownInterval)
                }

                this.countDownInterval = setInterval(function () {
                    if (_this.info.endTime > 0) {
                        _this.countDown(val)
                        _this.info.endTime--
                    } else {
                        _this.requestRoomList()
                        if (_this.countDownInterval) {
                            clearInterval(_this.countDownInterval)
                        }
                    }
                }, 1000)
            },
            'custom.code'(data) {
                if (isNaN(data) || !data.trim().length) {
                    this.custom.code = ''
                } else {
                    if (!data.trim().length) return
                    this.custom.roomCode[this.custom.codeIndex] = data
                    if (this.custom.codeIndex < this.custom.roomCode.length - 1) {
                        this.custom.codeIndex++
                        this.custom.code = ''
                    }
                }

            },
            'custom.joinShow'(is) {
                if (is) {
                    setTimeout(_ => {
                        this.custom.codeIndex = 0
                        this.custom.codeFocus = true
                    }, 100)
                } else {
                    this.custom.code = ''
                    this.custom.roomCode = ['', '', '', '', '', '']
                    this.custom.codeIndex = -1
                    this.custom.codeFocus = false
                }
            }
        },
        mounted() {
            if (this.$route.params.type) {
                this.room.params.type = this.$route.params.type
                this.$router.replace('/')
            }
            this.requestRoomList()
            document.title = '幻联赛大厅';
        },
        methods: {
            isEmptyObject(e) {
                for (let t in e) return false;
                return true
            },
            requestRoomList() {
                this.room.loading = true
                if (!this.banner.list.length) {
                    this.banner.loading = true
                }
                let url = '/services/fantasy/room_list.php'
                this.room.params.platform = 'web'

                if (!this.member.info && !this.priceChange) {
                    var hostExt = {
                        'dev.lfl.gg': 'dev',
                        'staging-1.lfl.gg': 'stag1',
                        'staging-2.lfl.gg': 'stag2',
                        'staging-3.lfl.gg': 'stag3',
                        'lfl.gg': '',
                        'localhost': ''
                    }

                    let ext = hostExt[location.hostname] + '/'
                    url = 'http://img1.famulei.com/'+ ext +'jsondata/lfl/room_list_' + this.room.params.type + '.json'
                    this.axios.get(url).then(req => {
                        this.handleRoomList(req)
                    })
                } else {
                    this.api(url, this.room.params).then(req => {
                        this.handleRoomList(req)
                    })
                }
            },
            handleRoomList (req) {
                let data = req.data
                this.banner.list = data.banner_list || []
                this.banner.complete = true
                if (data.params) {
                    if (data.params.last_start_time) {
                        this.info.time = data.params.last_start_time
                    }
                    if (this.info.roomTotal == '-') this.info.roomTotal = data.params.ing_count
                }
                if (this.room.params.type == 0) this.room.matching_count = data.matching_count || 0

                if (data.count) {
                    let page = parseInt(data.count) / this.room.params.limit
                    if (parseInt(data.count) % this.room.params.limit !== 0) page += 1
                    this.room.pageTotal = parseInt(page)
                }

                if (data.list) {
                    if (this.room.params.page > 1) {
                        for (let i in data.list) {
                            this.room.list.push(data.list[i])
                        }
                    } else {
                        if (req.data.pop_up_data) {
                            const pop = req.data.pop_up_data[0]
                            if (pop) {
                                this.$root.hub.$emit('showPop', pop)
                            }
                        }
                        this.room.list = data.list
                    }
                    this.room.count = data.list.length
                }

                this.room.loading = false
                this.banner.loading = false
            },
            countDown(time) {
                let targetDate = this.moment(time, 'X')
                let now = this.moment()
                let calc = {
                    hours: function () {
                        return targetDate.diff(now, 'hours')
                    },
                    minutes: function () {
                        targetDate.subtract(calc.hours(), 'hours')
                        let m = targetDate.diff(now, 'minutes')
                        return m < 10 ? '0' + m : m
                    },
                    seconds: function () {
                        targetDate.subtract(calc.minutes(), 'minutes')
                        let s = targetDate.diff(now, 'seconds')
                        return s < 10 ? '0' + s : s
                    }
                }
                this.info.endTimeStr = calc.hours() + ':' + calc.minutes() + ':' + calc.seconds()
            },
            filterBtnHandle(item) {
                if (this.room.loading) return
                this.room.params.type = item.value
            },
            dragEndHandle() {
                this.room.params.min_price = this.slider.value[0]
                this.room.params.max_price = this.slider.value[1]
            },
            loadingMore() {
                this.room.params.page++
            },
            openLink(banner) {
                let url = banner.go_url_web
                if (url != '') {
                    if (url.indexOf('http') == -1) {
                        url = '//' + url
                    }
                    window.open(url)
                }
            },
            toCustom() {
                if (!this.$store.state.member.info) {
                    this.$root.hub.$emit('showLogin')
                    return
                }
                this.$router.push('/room/custom')
            },
            keyDownEvent(event) {
                if (this.custom.codeIndex > 0) {
                    if (event.target.value == '') {
                        this.custom.codeIndex--
                    }
                    this.custom.roomCode[this.custom.codeIndex] = ''
                }
            },
            joinCustomRoom () {
                if (!this.$store.state.member.info) {
                    this.$root.hub.$emit('showLogin')
                    return
                }
                this.custom.joinShow = true
            },
            requestCustom () {
                let customRoomCode = this.custom.roomCode.join('').trim()
                if (customRoomCode.length != 6) {
                    this.$message.warning('请输入正确的房间号')
                    return
                }
                this.api('/services/fantasy/room_into.php', {secret_key: customRoomCode}, _ => {}).then(req => {
                    if (req.code == 200) {
                        this.$router.push('/room/' + req.data.roomID)
                    } else {
                        this.$message.error(req.message)
                    }
                })
            }
        }
    }
</script>

<style lang="stylus">
    #home {
        .img {
            width 100%
            height auto
        }

        .carousel-box {
            background-color #0E1420
            height 300px
            transition-duration .3s

            &.hide {
                height 0
            }

            .carousel {
                width 1200px
                position absolute
                left calc((100% - 1200px) / 2)
                margin 0 auto

                .carousel-3d-slide {
                    background-color transparent
                //transition-duration .75s !important
                    background-size 85%
                    background-position center
                    background-repeat no-repeat
                    opacity .5 !important
                    transition-duration .3s !important
                    overflow hidden

                    a {
                        display block
                        width 100%
                        height 100%
                    }

                    &.link {
                        cursor pointer
                    }

                    &.current {
                        background-size 90%
                        opacity 1 !important
                    }
                }

                .carousel-3d-controls {
                    top 0
                    margin 0

                    a {
                        width 215px !important
                        height 300px !important
                        line-height 300px !important
                        position absolute
                        display block
                        font-family 'icon'
                        font-size 12px
                        color #fff
                        background-image: linear-gradient(-90deg, rgba(15, 19, 28, 0) 0%, rgb(14, 20, 32) 100%);
                        transition-duration .3s
                        opacity .9

                        &:hover {
                            opacity 1

                            &:before {
                                opacity .7
                            }
                        }

                        &:before {
                            opacity .3
                            content '\e607'
                            position absolute
                            transition-duration .3s
                            top 20px
                        }

                        &.prev {
                            left 0

                            &:before {
                                transform: rotate(180deg)
                                left 35px
                                padding-top 25px
                            }
                        }

                        &.next {
                            right 0 !important
                            background-image: linear-gradient(-90deg, rgb(14, 20, 32) 0%, rgba(15, 19, 28, 0) 100%);

                            &:before {
                                right 35px
                                padding-bottom 25px
                            }
                        }

                        span {
                            display none
                        }
                    }
                }
            }
        }

        .room-hall {
            margin-top 45px

            > div {
                height 140px
                position relative
            }

            > .actions {
                width 255px
                background: #FFFFFF;
                border: 1px solid #E7EDF1;
                box-shadow: 0 1px 4px 0 rgba(5, 17, 25, 0.06);
                border-radius: 2px;
                float left

                &:before {
                    content ''
                    display block
                    left ((100% - 1px) / 2)
                    top 20px
                    bottom 20px
                    width 1px
                    height 100px
                    background-color #E7EDF1
                    position absolute
                }

                > div {
                    float left
                    width 50%
                    text-align center
                    height 100%
                    padding-top 35px
                    cursor pointer
                    user-select none
                    transition-duration .3s

                    &.custom {

                        > .buttons {
                            visibility hidden
                            position absolute
                            width 140px
                            left 235px
                            top 0
                            bottom 0
                            opacity 0
                            z-index 10
                            background-color #fff
                            border-right 1px solid #E7EDF1
                            border-top-right-radius 2px
                            border-bottom-right-radius 2px
                            box-shadow 2px 1px 4px 0 rgba(5, 17, 25, 0.06)
                            transition-duration .3s
                            overflow hidden

                            padding 26px 0

                            .el-button {
                                width 100px
                                padding 0
                                border-color #1ac6fd
                                color #1ac6fd
                                display block
                                margin-left auto
                                margin-right auto

                                + .el-button {
                                    margin-top 15px
                                }
                            }
                        }

                        &.join-show {
                            .buttons {
                                opacity 1
                                visibility visible
                                border-radius 0
                                border-right 1px solid transparent
                                box-shadow 2px 1px 4px 0 rgba(5, 17, 25, 0)
                            }

                            .join-room-box {
                                width 459px
                                visibility visible
                                border-top-right-radius 2px
                                border-bottom-right-radius 2px
                                opacity 1
                            }
                        }

                        .join-room-box {
                            visibility hidden
                            opacity 0
                            position absolute
                            overflow hidden
                            left 375px
                            top 0
                            bottom 0
                            width 0
                            z-index 10
                            background-color #fff
                            border-right 1px solid #E7EDF1
                            transition-duration .3s

                            .room-number-box {
                                width 400px
                                padding 26px 0 0 48px

                                .room-number {
                                    height 36px
                                    line-height 36px
                                    cursor default

                                    .text {
                                        width 78px
                                        font-size 14px
                                        color #A5A8B2
                                    }

                                    .input-box {
                                        width 218px
                                        border 1px solid #DDE4E9
                                        margin-left 10px
                                        position relative

                                        .box {
                                            float left
                                            width 36px
                                            height 36px
                                            display inline-block
                                            border none
                                            text-align center
                                            font-family TradeGothicLT-Bold
                                            font-size 16px

                                            &.hide {
                                                color transparent
                                            }

                                            + .box {
                                                border-left 1px solid #DDE4E9
                                            }
                                        }

                                        input {
                                            font-family TradeGothicLT-Bold
                                            font-size 16px
                                            background transparent
                                            width 36px
                                            height 36px
                                            position absolute
                                            text-align center
                                            left 0
                                            top 0
                                            border none
                                            transition-duration .05s

                                            &:focus {
                                                box-shadow 0 0 0 1px #0497f8
                                            }
                                        }

                                    }

                                }

                                .buttons {
                                    margin-top 15px
                                    padding-left 88px
                                    text-align left
                                    .el-button {
                                        width 102px
                                    }
                                }
                            }
                        }

                        &:hover {
                            .buttons {
                                opacity 1
                                visibility visible
                            }
                        }
                    }

                    a {
                        display block
                    }

                    &.disabled {
                        opacity .3
                        cursor no-drop
                    }

                    &:hover {
                    }

                    img {
                        height 29px
                        width auto
                    }

                    .label {
                        margin-top 8px
                        height 20px
                        line-height 20px
                        font-weight bold
                        font-size 14px
                    }

                    .desc {
                        font-size: 12px;
                        color: #A5A8B2;
                        height 16px
                        line-height 16px
                    }

                    &:first-child {
                        .label {
                            color #6F41BF
                        }
                    }

                    &:last-child {
                        .label {
                            color #0EA4FC
                        }
                    }
                }
            }

            .filter {
                background: #FFFFFF;
                border: 1px solid #E7EDF1;
                box-shadow: 0 1px 4px 0 rgba(5, 17, 25, 0.06);
                border-radius: 2px;
                float left
                width 565px
                padding 18px 31.5px
                margin-left 15px

                .btn {
                    cursor pointer
                    user-select none
                    background #fff
                    border 1px solid #D4DAE0
                    box-shadow 0 1px 4px 0 rgba(5, 17, 25, 0.06)
                    border-radius 4px
                    margin 7.5px
                    font-size 14px
                    text-align center
                    color: #373A41
                    display inline-block
                    width 110px
                    height 36px
                    line-height 36px
                    transition-duration .3s

                    &.disabled {
                        border-color #d1dbe5
                        color #bfcbd9
                        cursor no-drop
                    }

                    &.active {
                        background #0C9DFC
                        border 1px solid #0497F8
                        box-shadow 0 2px 4px 0 rgba(12, 157, 252, 0.40)
                        color #fff
                    }

                    &:not(.disabled):hover {
                        box-shadow 0 1px 4px 2px rgba(5, 17, 25, 0.1)
                    }
                }
            }

            .price {
                width 350px
                height 140px
                float right
                padding 20px 45px 0
                position relative
                z-index 5

                .icon.bg {
                    width 100%
                    height 100%
                    color #fff
                    position absolute
                    left 0
                    top 0
                    z-index -1
                }

                &:after, &:before {
                    content ''
                    display block
                    position absolute
                    left 0
                    right 0
                    height 1px
                    z-index -1
                }

                &:before {
                    top 0
                    box-shadow 0 0 4px 0 rgba(5, 17, 25, 0.06)
                    border-top 1px solid #E7EDF1
                }

                &:after {
                    bottom 0
                    box-shadow 0 1px 4px 0 rgba(5, 17, 25, 0.06)
                    border-bottom 1px solid #E7EDF1
                }

                .info {
                    .key {
                        font-size 12px
                        color #a5a8b2
                        height 16px
                    }
                    .val {
                        font-size 16px
                        line-height 22px
                        font-family TradeGothicLT-Bold
                        color #0c9dfc
                        > div {
                            width 50%
                        }
                        .fl {
                            text-align left
                        }
                        .fr {
                            text-align right
                        }
                    }
                }

                .range {
                    margin-top 15px
                    overflow hidden

                    .tickets {
                        font-family TradeGothicLT-Bold
                        font-size 14px
                        height 16px
                        line-height 17px
                        display inline-block
                        vertical-align middle
                        color #0C9DFC
                        min-width 45px
                        position relative
                        padding-left 22px
                        text-align left

                        &:before {
                            content '\e608'
                            font-family 'icon'
                            vertical-align middle
                            margin-right 7px
                            display inline-block
                            font-size 16px
                            position absolute
                            left 0
                        }

                        &.fr {

                        }

                    }
                }

                .slider {
                    margin-top 12px
                    height 18px

                    .vue-slider-dot {
                        transition-duration .3s
                        box-shadow 0 2px 8px 0 rgba(0, 0, 0, 0.25)

                        &:hover {
                            box-shadow 0 1px 5px 0 rgba(0, 0, 0, 0.5)
                            cursor -webkit-grab
                        }

                        &:after,
                        &:before {
                            content ''
                            background #E7EDF1
                            box-shadow inset 0 0 0 0 rgba(0, 0, 0, 0.10)
                            border-radius 5px
                            position absolute
                            width 2px
                            height 8px
                            display block
                            top 5px
                        }

                        &:before {
                            left 6px
                        }

                        &:after {
                            right 6px
                        }
                    }

                    .strip {
                        height 6px
                        background #E7EDF1
                        box-shadow inset 0 1px 0 0 rgba(0, 0, 0, 0.06)
                        border-radius 8px
                        position relative

                        .bg {
                            background #0C9DFC
                            border 1px solid #0497F8
                            box-shadow 0 1px 4px 0 rgba(12, 157, 252, 0.40)
                            border-radius 8px
                            position absolute
                            left 0
                            height 6px
                        }

                        .btn {
                            background #FFFFFF
                            box-shadow 0 2px 5px 0 rgba(0, 0, 0, 0.25)
                            border-radius 50%
                            width 18px
                            height 18px
                            position absolute
                            left 0
                            top -6px
                            cursor -webkit-grab

                            &.dragging {
                                cursor -webkit-grabbing
                            }

                            &:after,
                            &:before {
                                content ''
                                background #E7EDF1
                                box-shadow inset 0 0 0 0 rgba(0, 0, 0, 0.10)
                                border-radius 5px
                                position absolute
                                width 2px
                                height 8px
                                display block
                                top 5px
                            }

                            &:before {
                                left 6px
                            }

                            &:after {
                                right 6px
                            }
                        }
                    }
                }
            }
        }
    }
</style>
