<template>
    <div id="invitation" @paste="pasteEvent">

        <div class="action-buttons">
            <el-button :class="{'active': tabIndex == 0}" @click="tabIndex = 0">邀请好友</el-button>
            <el-button :class="{'active': tabIndex == 1}" @click="tabIndex = 1">输入邀请码</el-button>
        </div>

        <transition enter-active-class="animated zoomIn">
            <main class="main invite-friends" v-if="tabIndex == 0">

                <div class="animateImage">
                    <img class="invitation-main-decoration" src="/static/image/invitation-main-decoration.png" :style="{transform: 'translateX('+ parallax.decoration.x +'px) ' + 'translateY('+ parallax.decoration.y +'px)'}"/>
                    <img class="invitation-main-img" src="/static/image/invitation-main.png" :style="{transform: 'translateX('+ parallax.main.x +'px) ' + 'translateY('+ parallax.main.y +'px)'}"/>
                </div>

                <div class="my-code" v-if="invitation.my_invitation_code">
                    <div class="line"></div>
                    <div class="tips">已成功邀请 {{invitation.success_invite_number}} 位好友，获得 {{invitation.success_invite_key_number}} 门票<span @click="invitationDialog.show = true">（看看他们是谁）</span></div>
                    <div class="box-wrap" :class="{'no': invitation.invite_code_surplus_times == 0}">
                        <div class="box code">
                            <div class="title">我的邀请码</div>
                            <div class="code-string">{{invitation.my_invitation_code}}</div>
                            <div class="last">{{invitation.invite_code_surplus_times > 0 ? '本月还能使用' + invitation.invite_code_surplus_times + '次' : '本月邀请次数已用完 每个月1号重置'}}</div>
                        </div>
                        <div class="box share">
                            <div class="title">分享</div>
                            <div class="share-wrap">
                                <div class="share-item" v-clipboard="invitation.share_text" @success="$message.success('复制成功')" @error="$message.error('复制失败')">
                                    <lfl-icon icon="share-copy"></lfl-icon>
                                    <div class="text">复制邀请码</div>
                                </div>
                                <div class="share-item" @click="share('weibo')">
                                    <lfl-icon icon="share-weibo"></lfl-icon>
                                    <div class="text">微博</div>
                                </div>
                                <div class="share-item" @click="share('weixin')">
                                    <lfl-icon icon="share-wechat"></lfl-icon>
                                    <div class="text">微信</div>
                                </div>
                                <div class="share-item" @click="share('qzone')">
                                    <lfl-icon icon="share-qzone"></lfl-icon>
                                    <div class="text">QQ空间</div>
                                </div>
                                <div class="share-item" @click="share('facebook')">
                                    <lfl-icon icon="share-facebook"></lfl-icon>
                                    <div class="text">Facebook</div>
                                </div>
                                <div class="share-item" @click="share('twitter')">
                                    <lfl-icon icon="share-twitter"></lfl-icon>
                                    <div class="text">Twitter</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </transition>

        <transition enter-active-class="animated flipInY">
            <main class="main accept-invitation" v-if="tabIndex == 1">
                <div class="tips">
                    <p>使用好友邀请码后</p>
                    <p>双方各自获得<span class="light"><span>5</span>门票</span></p>
                </div>
                <div class="box">
                    <div class="title" :class="{'accept': invitation.invitation_code}"><span v-if="invitation.invitation_code">已接收来自“<a class="name" :href="domain + '/u/' + invitation.member_id_invitation_code" target="_blank">{{invitation.member_id_invitation_code_nickname}}</a>”的邀请</span><span v-else>请输入6位数邀请码</span></div>
                    <div class="code-input">
                        <div class="code-box" v-if="!invitation.invitation_code">
                            <span class="code" v-for="(code,index) in codeInput.codeArr" :key="index" :class="{'focus': codeInput.codeIndex == index}">{{code}}</span>
                            <input @keydown.delete="keyDownEvent($event)" v-model="codeInput.code" v-focus="codeInput.codeFocus" min="0" max="9" maxlength="1" :style="{left: codeInput.codeIndex * (codeInput.codeIndex == 0 ? 50 : 70) + 'px'}" />
                        </div>
                        <div class="code-string" v-else>{{invitation.invitation_code}}</div>
                    </div>
                    <el-button :loading="codeInput.loading" class="accept-button" @click="acceptInvitation" :disabled="invitation.invitation_code || codeInput.length != 6" :class="{'accept': invitation.invitation_code}">{{invitation.invitation_code ? '已' : ''}}接受邀请</el-button>
                </div>
            </main>
        </transition>

        <el-dialog title="已成功邀请好友" class="invitation" top="30%" :visible.sync="invitationDialog.show">
            <div class="list" v-loading="invitationDialog.loading">
                <VuePerfectScrollbar class="scrollbar" @ps-y-reach-end="scrollEnd">
                    <div class="row head">
                        <div class="col date">日期</div>
                        <div class="col user">好友</div>
                        <div class="col reward">奖励</div>
                    </div>
                    <div class="row" v-for="(item,index) in invitationDialog.list" :key="index">
                        <div class="col date">{{item.date || ''}}</div>
                        <div class="col user"><a class="name" :href="domain + '/u/' + item.member_id" target="_blank"><img v-if="item.member_id" :src="item.member_avatar || '/static/image/avatar.jpg'" /><span>{{item.member_nickname || ''}}</span></a></div>
                        <div class="col reward"><span v-if="item.change_value">+{{item.change_value}}</span><lfl-icon v-if="item.change_value_key" :icon="item.change_value_key" :class="item.change_value_key"></lfl-icon></div>
                    </div>
                </VuePerfectScrollbar>
            </div>
        </el-dialog>

        <lfl-footer></lfl-footer>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                tabIndex: 0,
                parallax: {
                    height: 509,
                    decoration: {
                        center: {
                            x: 0,
                            y: 0
                        },
                        width: 1128,
                        x: 0,
                        y: 0
                    },
                    main: {
                        center: {
                            x: 0,
                            y: 0
                        },
                        width: 751,
                        x: 0,
                        y: 0
                    }
                },
                codeInput: {
                    codeArr: ['', '', '', '', '', ''],
                    codeIndex: -1,
                    codeFocus: false,
                    code: '',
                    length: 0,
                    loading: false
                },
                invitation: {
                    invitation_code: '',
                    member_id_invitation_code: '',
                    member_id_invitation_code_nickname: '',
                    success_invite_number: 0,
                    success_invite_key_number: '',
                    my_invitation_code: '',
                    invite_code_surplus_times: 0,
                    share_text: ''
                },
                invitationDialog: {
                    show: false,
                    list: [],
                    lastCount: 0,
                    params: {
                        ssdb_key: '',
                        limit: 10
                    },
                    loading: false
                },
                shareUrl: 'http://t.cn/RpvmOpQ',
                shareConfig: {
                    appkey: '20e5823597d0c',
                    params: {
                        url: 'http://t.cn/RpvmOpQ',
                        title: '伐木累幻联赛',
                        description: '',
                        pic: 'http://lfl.gg/static/image/share.png'
                    }
                }
            }
        },
        computed: {
            member() {
                return this.$store.state.member
            }
        },
        mounted () {
            this.initParallax()
            if (!this.member.info) {
                setTimeout(_ => {
                    this.$root.hub.$emit('showLogin')
                }, 0)
            } else {
                this.init()
            }

            this.$nextTick(function () {
                const script = document.createElement('script')
                script.id = '-mob-share'
                script.src = 'http://f1.webshare.mob.com/code/mob-share.js'
                document.body.appendChild(script)
            })
        },
        watch: {
            '$store.state.member.info'(login) {
                this.init()
            },
            'codeInput.code'(data) {
                if (!/^[0-9a-zA-Z]*$/g.test(data) || !data.trim().length) {
                    this.codeInput.code = ''
                } else {
                    if (!data.trim().length) return
                    this.codeInput.codeArr[this.codeInput.codeIndex] = data
                    if (this.codeInput.codeIndex < this.codeInput.codeArr.length - 1) {
                        this.codeInput.codeIndex++
                        this.codeInput.code = ''
                    }
                }
                this.codeInput.length = this.codeInput.codeArr.join('').length
            },
            tabIndex (index) {
                if (index == 1) {
                    setTimeout(_ => {
                        this.codeInput.codeIndex = 0
                        this.codeInput.codeFocus = true
                    }, 100)
                } else {
                    this.codeInput.code = ''
                    this.codeInput.codeArr = ['', '', '', '', '', '']
                    this.codeInput.codeIndex = -1
                    this.codeInput.codeFocus = false
                }
            }
        },
        methods: {
            share (type) {
                if (window.mobShare) {
                    this.setShareConfig(type)
                    window.mobShare(type).send()
                }
            },
            setShareConfig (type) {
                if (mobShare) {
                    if (!this.shareConfig.params.description) this.shareConfig.params.description = this.invitation.share_text
                    this.shareConfig.params.url = type == 'weibo' || type == 'twitter' ? '' : this.shareUrl
                    mobShare.config(this.shareConfig)
                }
            },
            initParallax () {
                this.setCenterCoordinates()
                this.$root.hub.$on('mousemove', this.mouseMoveHandler)
            },
            setCenterCoordinates() {
                this.parallax.decoration.x = (document.body.clientWidth - this.parallax.decoration.width) / 2
                this.parallax.decoration.center = {
                    x: (document.body.clientWidth - this.parallax.decoration.width) / 2,
                    y: document.body.clientHeight / 2
                }

                this.parallax.main.x = (document.body.clientWidth - this.parallax.main.width) / 2
                this.parallax.main.center = {
                    x: (document.body.clientWidth - this.parallax.main.width) / 2,
                    y: document.body.clientHeight / 2
                }
            },
            pasteEvent (e) {
                if (e.clipboardData) {
                    let text = e.clipboardData.getData('Text').replace(/\s+/g,'')
                    if (/^[0-9a-zA-Z]{6}$/g.test(text)) {
                        this.codeInput.codeIndex = 0
                        console.log(text)
                        for (let i = 0;i < 6;i++) {
                            this.codeInput.codeArr[i] = text.charAt(i)
                        }
                        this.codeInput.codeIndex = 5
                        this.codeInput.code = text.charAt(5)
                    }
                }
            },
            mouseMoveHandler (e) {
                this.parallax.decoration.y = (e.screenY / this.parallax.decoration.center.y) * -15
                this.parallax.decoration.x = ((e.screenX / this.parallax.decoration.center.x) * -15) + this.parallax.decoration.center.x

                this.parallax.main.y = (e.screenY / this.parallax.main.center.y) * 5
                this.parallax.main.x = ((e.screenX / this.parallax.main.center.x) * 5) + this.parallax.main.center.x
            },
            keyDownEvent(event) {
                if (this.codeInput.codeIndex > 0) {
                    if (event.target.value == '') {
                        this.codeInput.codeIndex--
                    }
                    this.codeInput.codeArr[this.codeInput.codeIndex] = ''
                }
                this.codeInput.length = this.codeInput.codeArr.join('').length
            },
            acceptInvitation () {
                if (this.codeLength != 6) {
                    this.$message.warning('请输入正确的邀请码')
                }
            },
            init () {
                this.getMemberInvitation()
                this.getInvitationList()
            },
            getMemberInvitation () {
                this.api('/services/userCenter/inviting_friends.php').then(req => {
                    if (req.code == 200) {
                        this.invitation = req.data
                    }
                })
            },
            scrollEnd () {
                if (this.invitationDialog.lastCount != this.invitationDialog.params.limit || this.invitationDialog.loading) return
                this.invitationDialog.params.ssdb_key = this.invitationDialog.list[this.invitationDialog.list.length - 1].ssdb_key
                this.getInvitationList()
            },
            getInvitationList () {
                this.invitationDialog.loading = true
                this.api('/services/userCenter/inviting_log_list.php', this.invitationDialog.params).then(req => {
                    if (req.code == 200) {
                        this.invitationDialog.lastCount = req.data.list.length
                        if (!this.invitationDialog.params.ssdb_key) {
                            let count = req.data.count
                            if (count < 5) {
                                for (let i = 0;i < (5 - count);i++) {
                                    req.data.list.push({})
                                }
                            }
                            this.invitationDialog.list = req.data.list
                        } else {
                            for (let i in req.data.list) {
                                this.invitationDialog.list.push(req.data.list[i])
                            }
                        }
                    }
                    this.invitationDialog.loading = false
                })
            },
            acceptInvitation () {
                this.codeInput.loading = true
                this.api('/services/userCenter/input_invitation_code.php',{invitation_code: this.codeInput.codeArr.join('')}).then(req => {
                    if (req.code == 200) {
                        this.invitation.invitation_code = req.data.invitation_code
                        this.invitation.member_id_invitation_code_nickname = req.data.member_id_invitation_code_nickname
                        this.$message.success('成功接受邀请')
                    }
                    this.codeInput.loading = false
                })
            }
        }
    }
</script>

<style lang="stylus" scoped>
    #invitation {
        position relative
        background-image url("/static/image/invitation.png")
        background-position center 20px
        background-repeat no-repeat

        .main {
            text-align center
            margin 64px auto 0

            &.invite-friends {
                .animateImage {
                    height 509px
                    position relative

                    img {
                        height 100%
                        width auto
                        display block
                        position absolute


                        &.invitation-main-decoration {
                            height 509px
                            left 0
                            right 0
                            top 0
                            bottom 0
                        }

                        &.invitation-main-img {
                            top 0
                            height 417px
                        }
                    }
                }

                .my-code {
                    height 266px
                    width 960px
                    padding 0 40px
                    margin -23px auto 0

                    .line {
                        width 100%
                        height 1px
                        background-image url('/static/image/invitation-main-bottom-line.png')
                        background-position center
                        background-size contain
                    }

                    .tips {
                        margin-top 40px
                        height 20px
                        line-height 20px
                        text-align center
                        font-size 14px
                        color #ffff

                        span {
                            color #636363
                            cursor pointer
                            user-select none
                        }
                    }

                    .box-wrap {
                        margin-top 40px
                        height 170px
                        color #fff

                        &.no {
                            .box {
                                &.code {
                                    width 100%
                                }
                                &.share {
                                    width 0
                                }
                            }
                        }

                        .box {
                            height 170px
                            background: rgba(0, 0, 0, 0.3)
                            border 1px solid rgba(55, 58, 65, 0.3)
                            border-radius 2px
                            transition-duration .3s
                            overflow hidden

                            &:hover {
                                border 1px solid rgba(55, 58, 65, 0.5)
                            }

                            &.code {
                                width 280px
                                float left
                                text-align center

                                .title {
                                    height 24px
                                    line-height 24px
                                    font-size 18px
                                    margin-top 30px
                                }

                                .code-string {
                                    height 40px
                                    line-height 40px
                                    margin-top 10px
                                    font-size 28px
                                    letter-spacing 8px
                                }

                                .last {
                                    margin-top 12px
                                    font-size 13px
                                    color #545966
                                    height 16px
                                    line-height 16px
                                }
                            }

                            &.share {
                                width 580px
                                float right
                                text-align center

                                .title {
                                    height 18px
                                    line-height 18px
                                    margin-top 20px
                                    margin-bottom 20px
                                }

                                .share-item {
                                    user-select none
                                    cursor pointer
                                    width 70px
                                    height 80px
                                    display inline-block
                                    text-align center
                                    margin 0 8px

                                    &:hover {
                                        .icon {
                                            transform scale(1.05)
                                        }
                                    }

                                    .icon {
                                        display block
                                        width 50px
                                        height 50px
                                        margin 0 auto
                                        transform scale(1)
                                        transition-duration .3s
                                    }

                                    .text {
                                        font-size 14px
                                        margin-top 12px
                                        height 20px
                                        line-height 20px
                                    }
                                }
                            }
                        }
                    }
                }
            }

            &.accept-invitation {
                .tips {
                    margin-top 80px
                    height 96px
                    line-height 48px
                    font-size 28px
                    color #fff
                    letter-spacing 10px

                    .light {
                        color #0C9DFC
                        span {
                            margin 0 5px
                            display inline-block
                        }
                    }
                }

                .box {
                    width 860px
                    height 480px
                    margin 40px auto 0
                    background rgba(0, 0, 0, 0.3)
                    border 1px solid rgba(55, 58, 65, 0.3)
                    border-radius 2px

                    .title {
                        height 20px
                        color #A5A8B2
                        text-align center
                        font-size 16px
                        letter-spacing 14px
                        margin-top 60px

                        &.accept {
                            letter-spacing 8px

                            .name {
                                letter-spacing 2px
                                color #565e74
                            }
                        }
                    }

                    .code-input {
                        width 680px
                        height 152px
                        margin 58px auto 0
                        background-image url('/static/image/invitation-code-input-bg.png')
                        background-position center
                        background-size contain
                        padding 51px 0

                        .code-box {
                            height 50px
                            text-align center
                            width 400px
                            margin 0 auto
                            position relative

                            .code {
                                + .code {
                                    margin-left 20px
                                }

                                &.focus {
                                    box-shadow 0 0 3px 2px rgba(15, 165, 252, 1)
                                }
                            }

                            .code,
                            input {
                                width 50px
                                height 50px
                                line-height 50px
                                display block
                                float left
                                background-color #fff
                                border-radius 4px
                                text-align center
                                font-size 20px
                            }

                            input {
                                position absolute
                                border none
                                top 0
                            }
                        }

                        .code-string {
                            height 50px
                            line-height 50px
                            font-size 48px
                            color #fff
                            letter-spacing 40px
                        }
                    }

                    .accept-button {
                        font-size 16px
                        width 240px
                        height 50px
                        margin 68px auto 0
                        display block
                        border-radius 5px
                        transition-duration .3s
                        border none

                        &.accept {
                            background-color rgba(84, 89, 102, 0.2)
                            color rgba(255, 255, 255, 0.5)
                        }

                        &:not(.is-disabled) {
                            color #fff

                            background-image linear-gradient(-29deg, #1CCCFE 0%, #0C9DFC 100%)

                            &:hover {
                                box-shadow none
                                background-image linear-gradient(-29deg, #19a7d0 0%, #0c81cf 100%)
                            }
                        }
                    }
                }
            }
        }

        .action-buttons {
            text-align center
            margin-top 80px

            .el-button {
                width 160px
                height 44px
                border 1px solid rgba(231, 237, 241, 0.1)
                background-color transparent
                border-radius 5px
                color #fff
                font-size 16px
                margin 0 20px
                transition-duration .3s

                &:active {
                    top 0
                }

                &.active {
                    background-image linear-gradient(-29deg, #1CCCFE 0%, #0C9DFC 100%)
                }

                &:hover {
                    border 1px solid rgba(231, 237, 241, 0.1)
                    background-color rgba(216, 216, 216, 0.1)
                    box-shadow none
                }
            }
        }

    }
</style>
