<template>
    <div id="order">
        <lfl-room-info :data="order" @timeIsUp="requestRoomInfo" v-loading="loading.room"></lfl-room-info>
        <div class="main">
            <div class="container">
                <div class="left fl" :class="{'show-lineup-compare': compare.targetOrder}">
                    <lfl-room-match :data="match" v-loading="loading.room"></lfl-room-match>
                    <lfl-player-detail class="order" :data="selectedPlayer" @closePlayerDetail="closePlayerDetail" :class="{'show': selectedPlayer}"></lfl-player-detail>
                    <div class="lineup-wrap" v-loading="loading.orderInfo">
                        <div class="lineup-detail-box" :class="{'show': selectLineup.team}">
                            <lfl-lineup-detail @closeLineupDetail="selectLineup.team = null" :order="order" :room="room" @playerDetail="playerDetail" :team="selectLineup.team" type="detail" v-if="selectLineup.team"></lfl-lineup-detail>
                        </div>
                        <div class="title">
                            <span class="text fix-bold-font">{{order.room_status == 0 ? '阵容数据' : order.room_status == 4 ? '实时数据' : '比赛结果'}}</span>
                            <span class="status" :class="'status-' + order.room_status">{{order.room_status == 0 ? '比赛未开始' : order.room_status == 4 ? 'LIVE' : '比赛已结束'}}</span>
                        </div>
                        <div class="body">
                            <!-- 单个阵容 -->
                            <lfl-lineup-detail :order="order" :room="room" :team="order.member_team[0]" @playerDetail="playerDetail" v-if="order.member_at_times == 1"></lfl-lineup-detail>
                            <!-- 多个阵容 -->
                            <div class="multiple-player-list" v-if="order.member_at_times > 1">
                                <VuePerfectScrollbar class="scrollbar" :settings="{wheelPropagation: true}">
                                    <div class="list-item" v-for="(team,index) in order.member_team" :key="index">
                                        <div class="player-list clearfix">
                                            <div class="player-item" v-for="(player,index) in team.player_list" :key="index">
                                                <div class="price">身价：<span>$<span>{{player.value}}</span></span></div>
                                                <div class="avatar" :style="{'background-image': 'url('+ player.bg2 +')' }" @click="playerDetail(player)">
                                                    <span class="score">{{room.status == 0 ? player.score : player.r_score}}</span>
                                                    <img :src="player.player_image || '/static/image/unknow.png'" />
                                                </div>
                                                <div class="info">
                                                    <div class="nickname">{{player.nickname}}</div>
                                                    <div class="position" v-if="player">
                                                        <lfl-icon :icon="'pos-' + player.position_short_name.toLowerCase()"></lfl-icon><span>{{player.position_short_name}} - {{player.team_short_name}}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="actions">
                                            <div v-if="room.status != 0"><span>{{room.status == 4 ? '当前' : '最终'}}排名：</span><span class="light">{{team.order_rank}} / {{team.at_times}}</span></div>
                                            <div><span>阵容{{order.status != 2 ? '平均' : '积'}}分：</span><span class="light">{{team.avg_score}}</span></div>
                                            <div v-if="room.status == 0"><span>剩余工资：</span><span class="light price"><span>$<span>{{laveSalary(team.player_list)}}</span></span></span></div>
                                            <div v-if="room.status != 0 && room.status != 4" class="reward">
                                                <span>奖励：</span>
                                                <div v-if="room.prize_type == 1" :data-val="team.order_prize_amount || 0" class="fruit"><lfl-icon icon="fruit"></lfl-icon></div>
                                                <div v-if="room.prize_type == 2" :data-val="team.order_prize_amount || 0" class="ticket"><lfl-icon icon="ticket"></lfl-icon></div>
                                                <div v-if="room.prize_type == 3" class="other fix-bold-font">{{team.order_prize_amount}}</div>
                                            </div>
                                            <div v-if="room.status == 0" class="fr">
                                                <el-button class="join-button" :class="{'is-disabled': parseInt(order.member_at_times) >= parseInt(room.times)}" @click="joinRoom(parseInt(order.member_at_times) >= parseInt(room.times))"><lfl-icon icon="add"></lfl-icon><span>{{order.member_at_times}} / {{room.times}}</span></el-button>
                                                <router-link :to="'/room/' + room.roomID + '/' + team.order_id"><el-button type="primary">编辑阵容</el-button></router-link>
                                            </div>
                                            <div v-if="room.status != 0" class="fr">
                                                <el-button type="primary" style="padding: 0 22px;" @click="selectLineup.team = team">查看详情</el-button>
                                            </div>
                                        </div>
                                    </div>
                                </VuePerfectScrollbar>
                            </div>
                        </div>
                    </div>
                    <div class="lineup-compare">
                        <div class="title">阵容对比
                            <el-radio-group v-if="order.member_team.length > 1" class="lineup-list" v-model="compare.orderIndex" size="small"><el-radio-button :label="index" v-if="index < 5" v-for="(item,index) in order.member_team" :key="index">阵容{{index+1}}</el-radio-button></el-radio-group>
                            <span class="close-btn" @click="compare.targetOrder = null"></span></div>
                        <div class="lineup-info" v-loading="loading.compare">
                            <div class="fl info-box" v-if="compare.data.self">
                                <div class="info-detail">
                                    <div class="nickname fix-bold-font">{{compare.data.self.member_nickname}}</div>
                                    <div class="data-row">
                                        <span class="key">阵容总分：</span>
                                        <span class="val">{{compare.data.self.total_score}}</span>
                                    </div>
                                    <div class="data-row">
                                        <span class="key">最终排名：</span>
                                        <span class="val">{{compare.data.self.rank}} / {{compare.data.self.room_info.at_times}}</span>
                                    </div>
                                </div>
                                <img :src="compare.data.self.member_avatar || '/static/image/avatar.jpg'" class="avatar">
                            </div>
                            <div class="fr info-box" v-if="compare.data.target">
                                <img :src="compare.data.target.member_avatar || '/static/image/avatar.jpg'" class="avatar">
                                <div class="info-detail">
                                    <div class="nickname fix-bold-font">{{compare.data.target.member_nickname}}</div>
                                    <div class="data-row">
                                        <span class="key">阵容总分：</span>
                                        <span class="val">{{compare.data.target.total_score}}</span>
                                    </div>
                                    <div class="data-row">
                                        <span class="key">最终排名：</span>
                                        <span class="val">{{compare.data.target.rank}} / {{compare.data.target.room_info.at_times}}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="vs">VS</div>
                        </div>
                        <div class="lineup-compare-list" v-loading="loading.compare" v-if="compare.data.self">
                            <div class="lineup-compare-item" v-if="compare.data.self" v-for="(item,index) in compare.data.self.player_list" :key="index">
                                <div class="player-info fl">
                                    <div class="avatar" :style="{'background-image': 'url(\''+ (compare.data.self.player_list[index].bg1 || '/static/image/bg1.png') +'\')' }">
                                        <img :src="compare.data.self.player_list[index].player_image || '/static/image/unknow.png'" />
                                    </div>
                                    <div class="info">
                                        <div class="player-name">{{compare.data.self.player_list[index].player_nickname}}</div>
                                        <div class="team-name">{{compare.data.self.player_list[index].team_short_name}}</div>
                                        <div class="vs-team-list">
                                            <div class="vs-team" v-for="(match,index) in compare.data.self.player_list[index].match_info" v-if="index < 2" :key="index" :class="matchScoreClass(match)">{{match.score == '未开始' ? 'vs' : match.score}} {{match.vs_team}}</div>
                                            <div class="clearfix"></div>
                                        </div>
                                    </div>
                                    <div class="score-box">
                                        <div class="box">
                                            <div class="title fix-bold-font">最终得分</div>
                                            <div class="value">{{compare.data.self.player_list[index].r_score}}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="position">
                                    <lfl-icon :icon="'pos-' + compare.data.self.player_list[index].position_short_name.toLowerCase()"></lfl-icon>
                                    <div class="text">{{compare.data.self.player_list[index].position_name}}</div>
                                </div>
                                <div class="player-info fr">
                                    <div class="avatar" :style="{'background-image': 'url(\''+ (compare.data.target.player_list[index].bg1 || '/static/image/bg1.png') +'\')' }">
                                        <img :src="compare.data.target.player_list[index].player_image || '/static/image/unknow.png'" />
                                    </div>
                                    <div class="info">
                                        <div class="player-name">{{compare.data.target.player_list[index].player_nickname}}</div>
                                        <div class="team-name">{{compare.data.target.player_list[index].team_short_name}}</div>
                                        <div class="vs-team-list">
                                            <div class="vs-team" v-for="(match,index) in compare.data.target.player_list[index].match_info" v-if="index < 2" :key="index" :class="matchScoreClass(match)">{{match.score == '未开始' ? 'vs' : match.score}} {{match.vs_team}}</div>
                                            <div class="clearfix"></div>
                                        </div>
                                    </div>
                                    <div class="score-box">
                                        <div class="box">
                                            <div class="title fix-bold-font">最终得分</div>
                                            <div class="value">{{compare.data.target.player_list[index].r_score}}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="right fr">
                    <div class="tabs" :class="[{'rank': tabIndex == 1 && room.status != 0 && room.status != 4},{'scroll': rankListScrollTop > 0}]">
                        <div class="tab" :class="{'active': tabIndex == 0}" @click="tabIndex = 0">聊天室</div>
                        <div class="tab" :class="{'active': tabIndex == 1}" @click="tabIndex = 1" v-if="room.status == 0 || room.status == 4">小道消息</div>
                        <div class="tab" :class="{'active': tabIndex == 1}" @click="tabIndex = 1" v-if="room.status != 0 && room.status != 4">积分排名</div>
                        <div class="active-bg" :style="{left: 87.5 + (tabIndex * 110) + 'px'}"></div>
                    </div>
                    <div class="main">
                        <div class="chat" v-loading="loading.chatRoom" :class="{'show': tabIndex == 0}">
                            <lfl-null :text="!room.dynamicID || room.dynamicID == 0 ? '聊天室暂未开启' : !comment.list.length ? '暂无内容' : ''" width="200" padding="200" v-if="!comment.list.length"></lfl-null>
                            <div class="msg-box" v-if="comment.list.length">
                                <VuePerfectScrollbar id="chatScrollbar" ref="chatScrollbar" class="scrollbar" @ps-scroll-y="chatScrollEvent">
                                    <div class="load-more-message" @click="loadMoreMessage" v-if="comment.lastCount == comment.params.limit" :class="{'not': comment.lastCount == 0}"><span>{{comment.lastCount > 0 ? '加载更多消息' : '没有更多消息'}}</span></div>
                                    <div class="msg-item clearfix" :class="{'self': member.info.nickname == item.nickname}" v-for="(item,index) in comment.list" :key="index">
                                        <img class="avatar" :src="(item.avatar || '/static/image/avatar.jpg')" />
                                        <div class="wrap">
                                            <div class="nickname">{{item.nickname}}</div>
                                            <div class="content">
                                                <!--<div class="title"></div>-->
                                                <div class="text" v-if="item.picture.length">
                                                    <img :src="img.image_url5" v-for="(img,index) in item.picture" :key="index" />
                                                </div>
                                                <div class="text" v-else v-html="item.content"></div>
                                            </div>
                                        </div>
                                    </div>
                                </VuePerfectScrollbar>
                            </div>
                            <div class="actions">
                                <input type="text" ref="commentInput" placeholder="点此输入评论" :disabled="!room.dynamicID || room.dynamicID == 0 || loading.submitComment" v-model="comment.submitParams.content_html" @keydown.enter="submitComment"/>
                                <button class="send-button" @click="submitComment" :disabled="!room.dynamicID || room.dynamicID == 0 || loading.submitComment || !comment.submitParams.content_html.length"><lfl-icon icon="up"></lfl-icon></button>
                            </div>
                        </div>
                        <div class="news" :class="{'show': tabIndex == 1}" v-if="room.status == 0 || room.status == 4">
                            <VuePerfectScrollbar class="scrollbar" :settings="{wheelPropagation: true}">
                                <div class="news-item" v-for="(item,index) in news.list" :key="index" @click="openNews(item.object_id)">
                                    <div class="image" :style="{backgroundImage: 'url(\''+ item.picture_list[0] +'\')'}"></div>
                                    <div class="content">
                                        <div class="title">{{item.title}}</div>
                                        <div class="info">
                                            <div class="author">
                                                <lfl-icon icon="user"></lfl-icon><span>{{item.nickname}}</span>
                                            </div>
                                            <div class="views">
                                                <lfl-icon icon="eye"></lfl-icon><span>{{item.view_count}}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <lfl-null v-if="!news.list.length" text="暂无小道消息" width="200" padding="200"></lfl-null>
                            </VuePerfectScrollbar>
                        </div>
                        <div class="rank" :class="[{'show': tabIndex == 1},{'scroll': rankListScrollTop > 0}]" v-if="room.status != 0 && room.status != 4">
                            <div class="top">
                                <div class="background"></div>
                                <img class="avatar" :src="member.info.avatar" />
                                <span class="nickname">{{member.info.nickname}}</span>
                                <div class="info">
                                    <div class="my-score">
                                        <div class="key fix-bold-font">
                                            <lfl-icon icon="my-score"></lfl-icon><span>我的总分</span>
                                        </div>
                                        <div class="val">{{order.total_score}}</div>
                                    </div>
                                    <div class="my-rank">
                                        <div class="key fix-bold-font">
                                            <lfl-icon icon="my-rank"></lfl-icon><span>我的排名</span>
                                        </div>
                                        <div class="val">{{order.rank}} / {{order.at_times}}</div>
                                    </div>
                                </div>
                                <div class="head">
                                    <div class="col">排名</div>
                                    <div class="col user">用户</div>
                                    <div class="col score">阵容积分</div>
                                    <div class="col">奖励</div>
                                </div>
                            </div>
                            <div class="body" v-loading="loading.rankList">
                                <VuePerfectScrollbar ref="scoreRankScrollbar" class="scrollbar" @ps-y-reach-end="loadMoreRank" @ps-scroll-y="scoreRankScrollEvent" :settings="{wheelPropagation: true}">
                                    <lfl-null text="暂无数据" v-if="!rank.list.length" padding="70" width="250"></lfl-null>
                                    <!--<el-tooltip class="item" effect="light" :content="'与 ' + item.member_nickname + ' 对比阵容'" placement="right" >-->
                                        <div class="row" v-for="(item,index) in rank.list" :key="index" :class="{'selected': compare.targetOrder == item}" @click="compare.targetOrder != item ? compare.targetOrder = item : compare.targetOrder = null">
                                            <div class="col index"><lfl-icon :icon="'NO-' + item.rank" v-if="item.rank <= 3"></lfl-icon><span v-else>{{item.rank}}</span></div>
                                            <div class="col user"><img :src="item.member_avatar || '/static/image/avatar.jpg'" />{{item.member_nickname}}</div>
                                            <div class="col score">{{item.total_score}}</div>
                                            <div class="col prize" :class="room.prize_type == 1 ? 'fruit' : room.prize_type == 2 ? 'ticket' : 'other'"><span>{{item.prize_amount}}</span><lfl-icon icon="fruit" v-if="room.prize_type == 1"></lfl-icon><lfl-icon icon="ticket" v-if="room.prize_type == 2"></lfl-icon></div>
                                        </div>
                                    <!--</el-tooltip>-->
                                </VuePerfectScrollbar>
                            </div>
                        </div>
                    </div>
                    <div class="clearfix"></div>
                </div>
                <div class="clearfix"></div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                match: {
                    index: 0,
                    selectedIndex: '',
                    list: [],
                },
                order: {
                    member_team: []
                },
                room: {
                    status: '',
                    dynamicID: '',
                    salary_cap: 0
                },
                comment: {
                    params: {
                        dynamic_id: '',
                        last_page_key: '',
                        limit: 20,
                        order_switch: 1
                    },
                    submitParams: {
                        dynamic_id: '',
                        content_html: ''
                    },
                    lastCount: 0,
                    list: []
                },
                rank: {
                    params: {
                        order_id: '',
                        start_id: '',
                        limit: 50,
                    },
                    lastCount: 0,
                    list: []
                },
                news: {
                    params: {
                        roomID: '',
                        last_key: '',
                        limit: 20,
                    },
                    list: []
                },
                loading: {
                    room: false,
                    matchList: false,
                    orderInfo: true,
                    chatRoom: false,
                    rankList: false,
                    submitComment: false,
                    compare: false
                },
                compare: {
                    data: {},
                    targetOrder: null,
                    orderIndex: 0
                },
                tabIndex: 0,
                rankListScrollTop: 0,
                pos: ['top','jun','mid','adc','sup'],
                selectLineup: {
                    team: null
                },
                selectedPlayer: null,
                requestCommentInterval: null,
                scrollTop: 0
            }
        },
        computed: {
            member () {
                return this.$store.state.member
            },
            orderStatus () {
                return this.room.status != 0 && this.room.status != 4 ? 2 : this.room.status == 4 ? 1 :0
            },
            start_id () {
                let id = 'ROOM_' + this.$route.params.roomId
                if (this.room.type == 8) {
                    id = id + '_' + this.room.member_at_times
                }
                return id
            }
        },
        watch: {
            '$store.state.member.token'(login) {
                if (login) {
                    this.init()
                } else {
                    this.$router.replace('/')
                }
            },
            'compare.orderIndex' () {
                this.requestCompareLineup()
            },
            'room.status' () {
                this.requestOrder()
            },
            room (data) {
                if (data) {
                    if (data.member_at_times == 0) {
                        if (data.status == 4 && data.member_at_times == 0) {
                            this.$message.warning('本房间已开始，去大厅看看吧')
                            this.$router.replace('/')
                        } else if (data.status == 1 || data.status == 2 || data.status == 3 || data.status == 5) {
                            this.$message.warning('本房间已关闭，去大厅看看吧')
                            this.$router.replace('/')
                        } else if (data.status == 0) {
                            if (data.at_times < data.num) {
                                this.$message.warning('你还没有参与过本房间，去选个阵容吧')
                                this.$router.replace('/room/' + data.roomID)
                            } else {
                                this.$message.warning('本房间已满，去大厅看吧')
                                this.$router.replace('/')
                            }
                        }
                    }
                }
            },
            order: {
                handler (order) {
                    if (order) {
                        this.requestCommentList(true)
//                        this.requestCommentInterval = setInterval(this.requestCommentList, 30 * 1000)
                        if (this.room.status == 2) {
                            this.requestRankList()
                        } else {
                            this.requestNewsList()
                        }
                    }
                }
            },
            'compare.targetOrder' (data) {
                if (data) {
                    this.requestCompareLineup()
                }
            }
        },
        beforeDestroy () {
            if (this.requestCommentInterval) {
                clearInterval(this.requestCommentInterval)
            }
        },
        mounted () {
            if (!this.member.info) {
                this.$root.hub.$emit('showLogin')
            }

            this.$root.hub.$on('scrollTop', scrollTop => {
                this.scrollTop = scrollTop
            })
            this.init()
        },
        methods: {
            init () {
                this.news.params.roomID = this.$route.params.roomId
                this.requestRoomInfo()
            },
            matchScoreClass (match) {
                let cls =  {
                    'ing': match.status == 1,
                    'end': match.status == 2
                }
                return cls
            },
            playerScoreStatus (match) {
                let str = '最终'
                let isEnd = true
                for (let i in match) {
                    if (match[i].status != 2) {
                        isEnd = false
                        break
                    }
                }
                if (!isEnd) str = '当前'
                return str
            },
            laveSalary (player_list) {
                let val = this.room.salary_cap
                for (let i in player_list) {
                    val -= player_list[i].value
                }
                return val
            },
            requestRoomInfo () {
                this.loading.room = true
                this.api('/services/fantasy/room_info.php', {roomID: this.$route.params.roomId}, req => {
                    this.$message.error(req.message)
                    this.$router.go(-1)
                }).then(req => {
                    if (req.code == 200) {
                        if (!req.data.roomID) {
//                            this.$router.push('/404')
                            return
                        }

                        this.room = req.data
                        this.match.list = req.data.room_matches
                        this.comment.submitParams.dynamic_id = this.room.dynamicID
                        this.comment.params.dynamic_id = this.room.dynamicID
                    }
                    this.loading.room = false
                })
            },
            requestOrder () {
                this.loading.orderInfo = true
                this.api('/services/fantasy/get_member_room.php', {platform: 'web',status: this.orderStatus, limit: 10,show_type: 2,start_id: this.start_id}).then(req => {
                    if (req.code == 200) {
                        let _roomOrderData = req.data.list[0]
                        if (!_roomOrderData) {
//                            this.$router.push('/404')
                            return
                        }
                        this.rank.params.order_id = _roomOrderData.member_team[0].order_id
                        for (let i in _roomOrderData.member_team) {
                            let _team = _roomOrderData.member_team[i]
                            _team.player_list = []
                            for (let key in _team) {
                                if (this.pos.indexOf(key) != -1) {
                                    _team.player_list.push(_team[key])
                                    delete _team[key]
                                }
                            }
                        }
                        this.order = _roomOrderData
                    }
                    this.loading.orderInfo = false
                })
            },
            requestCommentList (loading) {
                if (loading) {
                    this.loading.chatRoom = true
                }
                this.api('/services/dynamic/dynamic_text_live.php', this.comment.params, _=>{}).then(req => {
                    if (req.code == 200) {
                        let list = req.data.list
                        if (!this.comment.params.last_page_key) {
                            this.comment.list = list
                        } else {
                            list = list.reverse()
                            for (let i in list) {
                                this.comment.list.splice(0,0,list[i])
                            }
                        }

                        this.comment.lastCount = list.length

                        setTimeout( _=> {
                            if (!this.comment.list.length) return
                            if (!this.comment.params.last_page_key) {
//                                this.$refs.chatScrollbar.$el.scrollTop = this.$refs.chatScrollbar.$el.scrollHeight
//                                this.$refs.chatScrollbar.update(this.$refs.chatScrollbar.$el)
                                let chatScrollbar = document.getElementById('chatScrollbar');
                                chatScrollbar.scrollTop = chatScrollbar.scrollHeight
                            }
                        }, 10)
                    }
                    this.loading.chatRoom = false
                })
            },
            requestCompareLineup () {
                this.loading.compare = true
                this.api('/services/fantasy/lineup_contrast.php', {self_order_id: this.order.member_team[this.compare.orderIndex].order_id, target_order_id: this.compare.targetOrder.id}).then(req => {
                    if (req.code == 200) {
                        this.compare.data = req.data
                    }
                    this.loading.compare = false
                })
            },
            submitComment () {
                this.loading.submitComment = true
                this.api('/services/dynamic/dynamic_comment_insert.php', this.comment.submitParams).then(req => {
                    if (req.code == 200) {
                        this.requestCommentList()
                        this.comment.submitParams.content_html = ''
                    }
                    this.loading.submitComment = false
                    setTimeout(_ => {
                        this.$refs.commentInput.focus()
                    },10)

                })
            },
            requestRankList () {
                this.loading.rankList = true
                this.api('/services/fantasy/room_ranking_list.php', this.rank.params).then(req => {
                    if (req.code == 200) {
                        let list = req.data.list
                        if (!this.rank.params.start_id) {
                            this.rank.list = list
                        } else {
                            for (let i in list) {
                                this.rank.list.push(list[i])
                            }
                        }
                        this.rank.lastCount = list.length
                    }
                    this.loading.rankList = false
                })
            },
            requestNewsList () {
                this.api('/services/fantasy/gossip_article_list.php', this.news.params).then(req => {
                    if (req.code == 200) {
                        this.news.list = req.data.article_list
                    }
                })
            },
            loadMoreMessage() {
                if (this.comment.lastCount == 0) return
                this.comment.params.last_page_key = this.comment.list[0].page_key
                this.requestCommentList(true)
            },
            chatScrollEvent () {
            },
            scoreRankScrollEvent (event) {
                this.rankListScrollTop = event.target.scrollTop
            },
            loadMoreRank () {
                if (this.loading.rankList || !this.rank.list.length || this.rank.lastCount != this.rank.params.limit) return
                this.rank.params.start_id = this.rank.list[this.rank.list.length - 1].id
                this.requestRankList()
            },
            joinRoom (disabled) {
                if (disabled) {
                    this.$message.error('参与次数已达到上限')
                    return
                }
                this.$router.push('/room/' + this.order.roomID)
            },
            openNews (id) {
                let url = this.fmlUrl(this.domain +'/p/' + id, this.member, true)
                console.log(url)
                window.open(url,'_blank')
            },
            closePlayerDetail () {
                this.selectedPlayer = null
            },
            playerDetail (player) {
                this.selectedPlayer = player
            }
        }
    }
</script>

<style lang="stylus">
    @import "../../static/css/order.styl"
</style>