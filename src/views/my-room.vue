<template>
    <div id="my" :class="{'fixed-nav': $store.state.scrollTop >= 120}">
        <div class="room-wrap container">
            <div class="type-filter clearfix">
                <div :class="{'active': item.value == type.curr}" v-for="(item,index) in type.list" :key="index" @click="type.curr = item.value">{{item.label}}</div>
            </div>
            <lfl-room-list class="room-list-box" @loadingMore="loadingMore(0)" status="0" v-show="type.curr == 0" :data="room[0].data" v-loading="room[0].loading" element-loading-text="拼命加载中" path="/my/room/"></lfl-room-list>
            <lfl-room-list class="room-list-box" @loadingMore="loadingMore(1)" status="1" v-show="type.curr == 1" :data="room[1].data" v-loading="room[1].loading" element-loading-text="拼命加载中" path="/my/room/"></lfl-room-list>
            <lfl-room-list class="room-list-box" @loadingMore="loadingMore(2)" status="2" v-show="type.curr == 2" :data="room[2].data" v-loading="room[2].loading" element-loading-text="拼命加载中" path="/my/room/"></lfl-room-list>
        </div>
        <lfl-footer></lfl-footer>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                type: {
                    curr: '',
                    list: [
                        {label: '未开始', value: 0},
                        {label: '进行中', value: 1},
                        {label: '已结束', value: 2}
                    ]
                },
                room: {
                    0: {
                        loading: false,
                        data: {
                            params: {
                                platform: 'web',
                                limit: 10,
                                status: 0,
                                token: '',
                                show_type: 1,
                                start_id: ''
                            },
                            pageTotal: 0,
                            count: 0,
                            type: 'order',
                            list: []
                        }
                    },
                    1: {
                        loading: false,
                        data: {
                            params: {
                                platform: 'web',
                                limit: 10,
                                status: 1,
                                token: '',
                                show_type: 1,
                                start_id: ''
                            },
                            pageTotal: 0,
                            count: 0,
                            type: 'order',
                            list: []
                        }
                    },
                    2: {
                        loading: false,
                        data: {
                            params: {
                                platform: 'web',
                                limit: 10,
                                status: 2,
                                token: '',
                                show_type: 1,
                                start_id: ''
                            },
                            pageTotal: 0,
                            count: 0,
                            type: 'order',
                            list: []
                        }
                    }
                }
            }
        },
        mounted () {
            if (!this.$store.state.member.token) {
                this.$router.replace('/')
                return
            }
            let status = this.$route.path.substring(9)
            this.type.curr = status || 0
            document.title = '我的联赛';
        },
        watch: {
            'type.curr' () {
                this.$router.replace('/my/room/' + this.type.curr)
                this.requestRoom()
            },
            '$store.state.member.token' () {
                this.requestRoom ()
            }
        },
        methods: {
            requestRoom () {
                this.room[this.type.curr].loading = true
                this.api('/services/fantasy/get_member_room.php', this.room[this.type.curr].data.params).then(req => {
                    if (req.code == 200) {
                        this.room[this.type.curr].data.count = req.data.list.length
                        if (this.room[this.type.curr].data.params.start_id != '') {
                            for (let i in req.data.list) {
                                this.room[this.type.curr].data.list.push(req.data.list[i])
                            }
                        } else {
                            this.room[this.type.curr].data.list = req.data.list
                        }

                    }
                    this.room[this.type.curr].loading = false
                })
            },
            openUrl () {
                window.open('/room')
            },
            loadingMore (status) {
                let list = this.room[status].data.list
                this.room[status].data.params.start_id = list[list.length - 1].start_id
                this.requestRoom()
            }
        }
    }
</script>

<style lang="stylus">
    #my {
        .room-wrap {
            margin-top 40px
            background: #FAFBFD;
            border: 1px solid #E7EDF1;
            box-shadow: 0 1px 4px 0 rgba(5,17,25,0.06);
            border-radius: 2px;
            overflow hidden
            box-sizing content-box

            .type-filter {
                height 60px
                border-bottom: 1px solid #E7EDF1;
                box-shadow: 0 1px 4px 0 rgba(5,17,25,0.06);

                div {
                    cursor pointer
                    user-select none
                    display block
                    float left
                    width calc(100%/ 3)
                    background: #FFFFFF;
                    font-size: 18px;
                    color: #373A41;
                    height 60px
                    line-height 60px
                    text-align center

                    &.active {
                        font-weight bold
                        border-bottom 3px solid #0C9DFC
                    }

                    + div {
                        border-left 1px solid #E7EDF1
                    }
                }
            }

            .room-list-box {
                min-height 562px
                padding 0 15px 15px
            }
        }

        &.fixed-nav {
            .room-wrap {
                padding-top 60px

                .type-filter {
                    position fixed
                    width 1200px
                    top 0
                    z-index 20
                }
            }
        }
    }
</style>
