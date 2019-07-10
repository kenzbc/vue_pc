<template>
    <div id="header">
        <div class="container clearfix">
            <router-link to="/" class="logo-link">
                <lfl-icon icon="lfl" class="lfl"></lfl-icon>
                <div class="hls-text">
                    <lfl-icon icon="hls" class="hls"></lfl-icon>
                    <lfl-icon icon="lpl-copyright" class="lpl-copyright"></lfl-icon>
                </div>
            </router-link>
            <div class="nav fix-bold-font">
                <router-link to="/" :class="{'active': navIndex == 0}">幻联赛大厅</router-link>
                <router-link to="/my/room" :class="{'active': navIndex == 1}">我的联赛</router-link>
                <router-link to="/mall" :class="{'active': navIndex == 2}">兑换商城</router-link>
                <router-link to="/ranking" :class="{'active': navIndex == 3}">排行榜</router-link>
                <a :href="fmlUrl(hostname == 'lfl.gg' ? '/c/634' : '',member)" target="_blank">讨论社区</a>
                <div class="active-border" :style="{left: navLeft,bottom: navBottom}"></div>
            </div>
            <div class="right">
                <span class="fr login fix-bold-font" @click="$root.hub.$emit('showLogin')" v-if="!member.info">登录 / 注册</span>
                <div class="user" v-if="member.info">
                    <!--<span class="message"></span>-->
                    <router-link to="/my/detail" class="avatar"><img :src="member.info.avatar || '/static/image/avatar.jpg'" /></router-link>
                    <div class="profile-pop">
                        <div class="header">
                            <span @click="logout" class="logout"><lfl-icon icon="logout"></lfl-icon>登出</span>
                            <img class="avatar" :src="member.info.avatar || '/static/image/avatar.jpg'" />
                        </div>
                        <div class="body">
                            <div class="info">
                                <span class="nickname">{{member.info.nickname}}</span>
                                <span class="level" :class="'level-' + member.info.rank"></span>
                                <!--<img v-if="member.info.badge_image" class="badge" :src="member.info.badge_image">-->
                            </div>
                            <div class="data clearfix" v-if="member.bank">
                                <div class="row">
                                    <router-link to="/my/detail/diamond" class="data-span diamond fl"><span>钻石：</span><span class="light" :title="member.bank.diamond">{{member.bank.diamond | number}}</span><lfl-icon icon="diamond"></lfl-icon></router-link>
                                    <router-link to="/my/detail/ticket" class="data-span ticket fr"><span>门票：</span><span class="light" :title="member.bank.ticket">{{member.bank.ticket | number}}</span><lfl-icon icon="ticket"></lfl-icon></router-link>
                                </div>
                                <div class="row">
                                    <router-link to="/my/detail/fruit" class="data-span fruit fl"><span>果子：</span><span class="light" :title="member.bank.guozi1">{{member.bank.guozi1 | number}}</span><lfl-icon icon="fruit"></lfl-icon></router-link>
                                    <router-link to="/my/detail/key" class="data-span key fr"><span>钥匙：</span><span class="light" :title="member.bank.fantasy_key">{{member.bank.fantasy_key | number}}</span><lfl-icon icon="key"></lfl-icon></router-link>
                                </div>
                            </div>
                            <div class="list">
                                <router-link to="/my/detail" class="item detail" tag="div">我的明细</router-link>
                                <router-link to="/my/lineup" class="item group" tag="div">我的阵容</router-link>
                                <router-link to="/my/record" class="item record" tag="div">我的战绩</router-link>
                                <router-link to="/invitation" class="item invite" tag="div">邀请好友</router-link>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="recharge" v-if="member.info">
                    <router-link to="/recharge/diamond" class="button"><span>充值</span><lfl-icon icon="recharge"></lfl-icon></router-link>
                    <router-link to="/recharge/ticket" class="info">
                        <div class="my-ticket">我的门票</div>
                        <div class="ticket-number"><lfl-icon icon="ticket" :style="{marginRight: 2,width: 16}"></lfl-icon><span v-if="member.bank">{{member.bank.ticket}}</span></div>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                nav: ['/','/my/room','/mall','/ranking'],
                navPath: [['/room'],[],[],[]]
            }
        },
        methods: {
            logout () {
                this.api('/services/member/member_out.php').then(req => {
                    if (req.code == 200) {
                        this.$root.hub.$emit('removeMember')
                        this.$message.success('退出成功')
                        this.$router.replace('/')
                    } else {
                        this.$message.error(req.message)
                    }
                })
            },
        },
        computed: {
            hostname () {
                return location.hostname
            },
            member () {
                return this.$store.state.member
            },
            navIndex () {
                let nav = {
                    'home': 0,
                    'room': 0,
                    'room-order': 0,
                    'room-match': 0,
                    'room-custom': 0,
                    'room-custom-choose': 0,
                    'my-room-detail': 1,
                    'my-room': 1,
                    'my-room-0': 1,
                    'my-room-1': 1,
                    'my-room-2': 1,
                    'mall': 2,
                    'ranking': 3,
                }
                let index = nav[this.$route.name] > -1 ? nav[this.$route.name] : -1
                return index
            },
            navLeft () {
                return (this.navIndex * 115) + 'px'
            },
            navBottom () {
                return this.navIndex != -1 ? 0 : '-4px'
            }
        }
    }
</script>

<style lang="stylus">

    #header {
        height 80px;
        background-color #fff

        .container {
            position relative

            > * {
                display block
                float left
            }
        }

        .logo-link {
            width 274px
            height 60px
            margin 10px 0

            > * {
                height 60px
                vertical-align middle
                display inline-block
            }

            .hls-text {
                width 176px
                height 26px
                margin-left 10px
                position relative

                .lpl-copyright {
                    top 0
                    right 0
                    position absolute
                }
            }

            .icon {
                &.lfl {
                    height 60px
                    width 60px
                }

                &.hls {
                    width 96px
                    height 26px
                    position absolute
                    transition-duration .3s
                    color #191a1d
                }

                &.lpl-copyright {
                    width 70px
                    height 24px
                }
            }
        }

        .logo-title:before {
            content '\e603'
            font-size 16px
            font-family 'icon'
        }

        .title {
            height 30px
            line-height 30px
            margin 25px 25px 10px 20px
        }

        .nav {
            height 80px
            line-height 80px
            position relative
            overflow hidden
            margin-left 48px

            a {
                width 115px
                display block
                float left
                font-size 16px
                position relative
                text-align center
                transition-duration .08s

                &.active {
                    transform scale(1.1)
                    animation-timing-function ease-in
                }
            }

            .active-border {
                position absolute
                display block
                width 120px
                padding 0 30px
                transition-duration .2s

                &:after {
                    content ''
                    background-color #0c9dfc
                    display block
                    height 4px
                    width 60px
                    left 30px
                }
            }
        }

        .right {
            float right
            height 40px
            margin 22px 0

            .login {
                cursor pointer
                user-select none
                height 36px
                line-height 36px
                font-size 14px
                color #fff
                text-align center
                font-weight bold
                background-image: linear-gradient(-45deg, #0FB3FF 0%, #006AEE 100%);
                box-shadow: 0 2px 6px 0 rgba(17,149,252,0.30);
                border-radius: 4px;
                width 140px
            }

            .user {
                float left
                margin-right 25px
                height 60px
                position relative

                &:hover .profile-pop {
                    height 440px
                    opacity 1
                    visibility visible
                }

                > .avatar {
                    width 40px
                    height 40px
                    display inline-block
                    position relative

                    > img {
                        height 100%
                        width 100%
                        border-radius 50%
                        box-shadow 0 0 2px 0 #cecece
                    }
                }
            }

            .recharge {
                padding-left 25px
                height 40px
                text-align right
                float left
                border-left 1px solid #E7EDF1

                a {
                    display block
                    float right
                    height 40px
                    line-height 40px
                    text-align center
                    position relative

                    &.info {
                        margin-top 2px
                        text-align right

                        .my-ticket {
                            font-size 12px
                            font-weight bold
                            height 16px
                            line-height 16px
                            color #A5A8B2
                        }

                        .ticket-number {
                            height 24px
                            line-height 24px
                            font-family TradeGothicLT
                            font-weight bold
                            font-size 20px
                            color #0C9DFC
                        }
                    }

                    &.button {
                        width 70px
                        height 40px

                        &:after {
                            content ''
                            display block
                            position absolute
                            height 2px
                            bottom 0
                            left 0
                            right 0
                            box-shadow 0 2px 4px 0 rgba(12, 157, 252, 0.40)
                        }

                        .icon {
                            width 70px
                            height 40px
                            color #0C9DFC
                        }

                        span {
                            position absolute
                            display block
                            left 0
                            right 0
                            text-align center
                            font-size 16px
                            color #fff
                            z-index 1
                        }

                        img {
                            width 100%
                        }
                    }

                    + a {
                        margin-right 11px
                    }
                }
            }
        }


        .profile-pop {
            width 400px
            height 0
            opacity 0
            visibility hidden
            transition-duration .3s
            position absolute
            background-color #fff
            box-shadow 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04)
            border-radius 2px
            z-index 10001
            left -152px
            top 50px
            overflow hidden

            .header {
                height 100px
                background-image url('/static/image/bg-blue.png')
                background-size cover
                background-repeat no-repeat
                background-position center
                position relative

                .avatar {
                    width 80px
                    height 80px
                    border-radius 50%
                    border 2px solid #fff
                    position absolute
                    left 30px
                    top 60px
                    box-shadow 0 2px 2px 0 #cecece
                    background-color #cecece
                }

                .logout {
                    cursor pointer
                    position absolute
                    bottom 15px
                    right 15px
                    height 17px
                    line-height 17px
                    font-size 13px
                    color #FFFFFF

                    .icon {
                        margin-right 4px
                        width 12px
                        height 13px
                        color #FCFCFC
                    }
                }
            }

            .body {
                height 360px
                position relative
                padding-top 65px
                border 1px solid #D0D9E1
                border-top none
                border-radius 0 0 2px 2px

                .info {
                    left 125px
                    height 22px
                    position absolute
                    top 10px

                    > * {
                        display inline-block
                        vertical-align middle
                    }

                    .nickname {
                        font-size 16px
                        font-weight bold
                        height 22px
                        line-height 22px
                    }

                    .badge {
                        margin-left 5px
                        height 20px
                        max-width 20px
                    }
                }


                .data {
                    width 310px
                    height 80px
                    margin 0 auto

                    .row {
                        height 40px
                        line-height 40px

                        + .row {
                            border-top 1px solid #E7EDF1
                        }

                        .data-span {
                            width calc((100% - 1px) / 2)
                            display inline-block
                            font-size 14px

                            &.fr {
                                padding-left 24px
                            }

                            span,.icon {
                                display inline-block
                                vertical-align middle
                            }

                            .light {
                                font-size 20px
                            }

                            .icon {
                                margin-left 5px
                                width 16px
                                height 16px
                            }

                            + .data-span {
                                border-left 1px solid #E7EDF1
                            }

                            &.diamond {
                                .light,.icon {
                                    color #4BDCBA
                                }
                            }

                            &.ticket {
                                .light,.icon {
                                    color #0C9DFC
                                }
                            }

                            &.fruit {
                                .light,.icon {
                                    color #FFA646
                                }
                            }

                            &.key {
                                .light,.icon {
                                    color #CBA77A
                                }
                            }
                        }
                    }
                }

                .list {
                    margin-top 21px
                    border-top 1px solid #E7EDF1

                    .item {
                        border-bottom 1px solid #E7EDF1
                        padding 0 35px
                        height 40px
                        line-height 40px
                        cursor pointer
                        font-size 14px
                        color #586077

                        &:hover {
                            background-color #F3F5F7
                        }

                        &:before {
                            font-family 'icon'
                            display inline-block
                            width 20px
                            height 20px
                            margin-right 5px
                            font-size 16px
                        }

                        &.detail:before {
                            content '\e60a'
                        }

                        &.invite:before {
                            content '\e609'
                        }

                        &.group:before {
                            content '\e606'
                        }

                        &.record:before {
                            content '\e60b'
                        }

                    }
                }
            }
        }
    }

    [data-page=my-room-detail] {

        > .scrollbar {
            padding-top 80px
        }

        #header {
            position fixed
            width 100%
            left 0
            right 0
            z-index 2001
            top 0
            transition-duration .3s
        }

        &.scroll {
            #header {
                box-shadow 0 0 1px 1px rgba(202, 202, 202, 0.5)
            }
        }
    }

    [data-page=invitation] {
        background-image url('/static/image/invitation.jpg')
        background-size cover
        background-position top

        #header {
            background-color transparent


            .right {
                .user {
                    > .avatar {
                        > img {
                            box-shadow 0 0 1px 0 #cecece
                        }
                    }
                }

                .recharge {
                    border-left 1px solid rgba(231, 237, 241, 0.1)
                }
            }

            .logo-link {
                .icon {
                    &.hls {
                        color #fff
                    }
                }
            }

            .nav {
                a {
                    color #fff
                }
            }
        }
    }


    @media screen and (max-width: 1024px) {
        [data-page=mall] {
            #header {
                display none;
            }
        }
        [data-page=mall-detail] {
            #header {
                display none;
            }
        }
    }

</style>