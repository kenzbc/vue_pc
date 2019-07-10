<template>
    <div id="lineup">
        <div class="main">
            <div class="container">
                <div class="left fl" :class="{'showSelectBox': lineup.action}">
                    <lfl-player-detail class="lineup" :data="selectedPlayer" @closePlayerDetail="closePlayerDetail" :class="{'show': selectedPlayer}"></lfl-player-detail>
                    <div class="saved-box">
                        <div class="title">
                            我的阵容<span>最多还能保存 {{10 - lineupList.length}} 套阵容</span>
                        </div>
                        <div class="group-list">
                            <VuePerfectScrollbar class="scrollbar" :settings="{wheelPropagation: true}">
                                <div class="group" v-for="(group,groupIndex) in lineupList">
                                    <div class="title"><lfl-icon icon="group"></lfl-icon>{{group.name}}</div>
                                    <div class="list">
                                        <div class="item" v-for="(item,index) in group.player_list">
                                            <div class="avatar" :style="{'background-image': 'url(\''+ item.bg2 +'\')' }" @click="selectedPlayer = item">
                                                <span class="score">{{item.avg_score}}</span>
                                                <img :src="item.player_image || '/static/image/unknow.png'" />
                                            </div>
                                            <div class="name">{{item.nickname}}</div>
                                            <div class="pos"><lfl-icon :icon="'pos-' + item.position_short_name.toLowerCase()"></lfl-icon><span>{{item.position_short_name.toUpperCase()}} - {{item.team_short_name.toUpperCase()}}</span></div>
                                        </div>
                                        <div class="clear"></div>
                                    </div>
                                    <div class="actions">
                                        <div class="fl">
                                            <!--<span>参加房间数：<span class="blue">2</span></span>-->
                                            <span>阵容总分：<span class="blue">{{group.total_avg_score}}</span></span>
                                        </div>
                                        <div class="fr">
                                            <div @click="action('remove',group,groupIndex)" class="btn remove">删除</div>
                                            <div @click="action('edit',group,groupIndex)" class="btn edit">编辑</div>
                                        </div>
                                    </div>
                                </div>
                                <lfl-null v-if="!lineupList.length" :text="'暂无数据'"></lfl-null>
                            </VuePerfectScrollbar>
                        </div>
                    </div>
                    <div class="select-box">
                        <div class="title">
                            选择选手
                            <a href="javascript:;" class="close" @click="cancelEdit"></a>
                        </div>
                        <div class="pos-nav">
                            <div class="pos-item" v-for="(item,_pos) in pos.obj" :class="[{active: item.positionID == pos.currPos},{'selected': selectPlayer[item.positionID]}]" @click="pos.currPos = item.positionID">
                                <lfl-icon :icon="'pos-' + item.en"></lfl-icon>
                                <span class="pos-name">{{item.name}}</span>
                                <lfl-icon icon="selected" class="select"></lfl-icon>
                            </div>
                        </div>
                        <div class="player-list" ref="player-list" v-loading="loading.playerList">
                            <div class="head" v-if="posPlayerList.length">
                                <div class="col player">选手</div>
                                <div class="col data" @click="sortPlayer('score')"><span>平均表现</span><lfl-icon :icon="sort.score == '' ? 'sort' : 'sort-desc'" :class="sort.score"></lfl-icon></div>
                                <div class="col price" @click="sortPlayer('price')"><span>身价</span><lfl-icon :icon="sort.price == '' ? 'sort' : 'sort-desc'" :class="sort.price"></lfl-icon></div>
                                <div class="clear"></div>
                            </div>
                            <VuePerfectScrollbar class="scrollbar" :settings="{wheelPropagation: true}">
                                <lfl-null v-if="!posPlayerList.length"></lfl-null>
                                <div class="list">
                                    <div class="player-item" v-for="(item,index) in posPlayerList" :class="{'gary': selectPlayer[item.positionID] && selectPlayer[item.positionID].playerID != item.playerID}">
                                        <div class="avatar" :style="{'background-image': 'url('+ (item.bg1 || '/static/image/bg1.png') +')' }" @click="selectedPlayer = item">
                                            <img :src="item.player_image || '/static/image/unknow.png'" />
                                        </div>
                                        <div class="info">
                                            <div class="player-name" @click="selectedPlayer = item">
                                                <span>{{item.nickname}}</span><span class="badge" :class="'status-' + item.player_status">{{item.player_status | playerStatus}}</span>
                                            </div>
                                            <div class="team-name">{{item.team_name}}</div>
                                            <div class="vs-team-list">
                                                <div class="vs-team" v-for="team in item.match_info">vs {{team.vs_team}}</div>
                                            </div>
                                        </div>
                                        <div class="avg-score">
                                            <lfl-line-chart class="chart" :avgScore="item.score" :scoreList="item.score_list" :id="item.playerID"></lfl-line-chart>
                                            <div class="score">平均分：{{item.score}}</div>
                                        </div>
                                        <div class="price good">$<span>{{item.value}}</span></div>
                                        <div class="action">
                                            <div v-if="selectPlayer[item.positionID] && selectPlayer[item.positionID].playerID == item.playerID" class="btn remove" @click.stop="removePosPlayer(item)"></div>
                                            <div class="btn add" @click.stop="selectPlayerPos[item.positionID] = item" v-else></div>
                                        </div>
                                    </div>
                                </div>
                            </VuePerfectScrollbar>
                        </div>
                    </div>
                </div>
                <div class="right fr" v-loading="loading.orderInfo">
                    <div class="title">编辑阵容</div>
                    <div class="action-and-info">
                        <div class="actions">
                            <input type="text" placeholder="在此输入阵容名称" v-model="lineup.title" />
                        </div>
                        <div class="info">
                            <div class="item">
                                <div class="val good">$<span>{{sumPrice}}</span></div>
                                <div class="key">阵容总身价</div>
                            </div>
                            <div class="item">
                                <div class="val blue">{{sumScore}}</div>
                                <div class="key">阵容总分</div>
                            </div>
                            <div class="clear"></div>
                        </div>
                    </div>
                    <div class="select-player-list" v-loading="loading.playerRecommend">
                        <div class="player-item" v-for="(item,index) in _selectPlayer" :class="[{'null': !item}]" @click.stop="changePosNav(index)">
                            <div class="avatar" :style="{'background-image': 'url('+ (item && item.bg1 ? item.bg1 : '/static/image/bg1.png') +')' }">
                                <img :src="(item && item.player_image ? item.player_image : '/static/image/unknow.png')" />
                            </div>
                            <div class="info" v-if="item">
                                <div class="player-name">{{item.nickname}}</div>
                                <div class="team-name"><lfl-icon :icon="'pos-' + pos.obj[index].en"></lfl-icon><span>{{item.position_short_name}} - {{item.team_short_name}}</span></div>
                            </div>
                            <div class="avg-score" v-if="item">{{item.score}}</div>
                            <div class="price good" v-if="item">$<span>{{item.value}}</span></div>
                            <div class="action" v-if="item">
                                <a href="javascript:;" class="btn remove" @click.stop="removePosPlayer(item)"></a>
                            </div>
                            <div v-if="!item" class="pos">
                                <lfl-icon :icon="'pos-' + pos.obj[index].en"></lfl-icon> <span>{{pos.obj[index].name}}</span>
                            </div>
                            <div v-if="!item" class="tip">点击选人</div>
                        </div>
                    </div>
                </div>
                <div class="clear"></div>

                <el-dialog title="保存阵容" class="saveLineUp" top="30%" :visible.sync="editSubmit.dialog.show" :close-on-click-modal="!loading.editSubmit" :show-close="!loading.editSubmit">
                    <p>保存阵容会自动替换原有阵容</p>
                    <div class="actions">
                        <el-button type="primary" @click="submitEditRequest" :disabled="loading.editSubmit">确定保存</el-button>
                    </div>
                </el-dialog>

            </div>
        </div>
        <div class="footer">
            <div class="container">
                <span class="join"><span>已选择</span> <span class="count">{{selectCount}} / 5</span></span>
                <el-button type="primary" class="fr" :disabled="selectCount != 5 || loading.editSubmit" @click="editSubmit.dialog.show = true" v-if="lineup.action == 'edit'">保存阵容</el-button>
                <el-button type="primary" class="fr" :disabled="selectCount != 5 || loading.editSubmit" @click="addLineupRequest" v-else>创建阵容</el-button>
                <el-button class="fr cancel-btn" :disabled="loading.editSubmit" v-if="lineup.action" @click="cancelEdit">放弃编辑</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                pos: {
                    currPos: 3,
                    obj: {
                        1: {en: 'top', name: '上单', positionID: 3},
                        2: {en: 'jug', name: '打野', positionID: 4},
                        3: {en: 'mid', name: '中单', positionID: 2},
                        4: {en: 'adc', name: 'ADC', positionID: 1},
                        5: {en: 'sup', name: '辅助', positionID: 5}
                    },
                    revers: {
                        1:4,
                        2:3,
                        3:1,
                        4:2,
                        5:5
                    },
                    str: {
                        'adc': 1,
                        'mid': 2,
                        'top': 3,
                        'jug': 4,
                        'sup': 5
                    },
                    arr: ['top', 'jun', 'mid', 'adc', 'sup']
                },
                editSubmit: {
                    dialog: {
                        show: false
                    },
                    count: 1
                },
                sort: {
                    type: '',
                    price: '',
                    score: ''
                },
                saved: {
                    list: {
                        match: [],
                        favorite: []
                    },
                    type: 'match',
                    str: {
                        match: '匹配',
                        favorite: '收藏'
                    }
                },
                playerList : {
                    1: {
                        last_playerID: '',
                        list: [],
                        count: 0
                    },
                    2: {
                        last_playerID: '',
                        list: [],
                        count: 0
                    },
                    3: {
                        last_playerID: '',
                        list: [],
                        count: 0
                    },
                    4: {
                        last_playerID: '',
                        list: [],
                        count: 0
                    },
                    5: {
                        last_playerID: '',
                        list: [],
                        count: 0
                    }
                },
                selectPlayer: {
                    1: null,
                    2: null,
                    3: null,
                    4: null,
                    5: null,
                },
                selectPlayerPos: {
                    1: '',
                    2: '',
                    3: '',
                    4: '',
                    5: ''
                },
                lineupList: [],
                lineup: {
                    action: '',
                    title: '',
                    data: null,
                    editIndex: ''
                },
                loading: {
                    playerList: false,
                    lineupList: false,
                    editSubmit: false
                },
                selectedPlayer: null
            }
        },
        watch: {
            selectPlayerPos: {
                handler(data) {
                    for (let i in data) {
                        this.selectPlayer[i] = data[i]
                    }
                },
                deep: true
            },
            'pos.currPos' () {
                this.$refs['player-list'].scrollTop = 0
            },
            selectPlayer : {
                handler: function (data) {
                    for (let i in data) {
                        if (!data[i]) {
                            this.selectPlayerPos[i] = ''
                        }
                    }
                },
                deep: true
            },
            selectedPlayer (data) {
                if (data) {
                    data.info = {
                        match_list: []
                    }
                    this.requestPlayerInfo(data.id)
                }
            }
        },
        mounted () {
            this.requestLineupList()
            for (let pos in this.playerList) {
                this.requestPlayerList(pos)
            }
        },
        computed: {
            sumPrice () {
                let val = 0
                for (let i in this.selectPlayer) {
                    val += this.selectPlayer[i] ? parseInt(this.selectPlayer[i].value) : 0
                }
                return val
            },
            sumScore () {
                let val = 0
                for (let i in this.selectPlayer) {
                    val += this.selectPlayer[i] ? parseFloat(this.selectPlayer[i].score) : 0
                }
                return val.toFixed(1)
            },
            _selectPlayer () {
                let selectPlayer = {}
                for (let i in this.selectPlayer) {
                    selectPlayer[this.pos.revers[i]] = this.selectPlayer[i]
                }
                return selectPlayer
            },
            posPlayerList () {
                let _this = this
                let list = this.playerList[this.pos.currPos].list
                if (!list || !list.length) return []
                return _this.sort.type ? list.sort(function (a,b) {
                    if (parseFloat(a[_this.sort.type]) < parseFloat(b[_this.sort.type])) {
                        return _this.sort[_this.sort.type] === 'asc' ? 1 : -1
                    } else if (parseFloat(a[_this.sort.type]) > parseFloat(b[_this.sort.type])) {
                        return _this.sort[_this.sort.type] === 'asc' ? -1 : 1
                    } else {
                        return 0
                    }
                }) : list
            },
            selectCount () {
                let i = 0
                for (let z in this.selectPlayer) {
                    if (this.selectPlayer[z]) i++
                }
                return i
            },
            editLineUpData () {
                let data = {
                    name: this.lineup.title
                }
                for (let i in this.selectPlayer) {
                    data['playerID_' + i] = this.selectPlayer[i] ? this.selectPlayer[i].playerID : ''
                }
                return data
            },
        },
        methods: {
            cancelEdit () {
                this.lineup.editIndex = ''
                this.lineup.title = ''
                this.lineup.data = null
                this.lineup.action = ''
                this.clearSelect()
            },
            clearSelect () {
                for (let pos in this.selectPlayer) {
                    this.selectPlayer[pos] = null
                }
            },
            action(type, item, index) {
                switch (type) {
                    case 'remove': {
                        this.$confirm('确定要删除这个阵容吗', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                        }).then(() => {
                            this.loading.playerList = true
                            this.api('/services/fantasy/lineup_del.php', {id: item.id}).then(req => {
                                if (req.code == 200) {
                                    this.$message.success(req.message)
                                    this.lineupList.splice(index, 1)
                                } else {
                                    this.$message.error(req.message)
                                }
                                this.loading.playerList = false
                            })
                        })
                        break
                    }
                    case 'edit': {
                        for (let i in item.player_list) {
                            let _player = item.player_list[i]
                            this.selectPlayerPos[_player.positionID] = _player
                        }
                        this.lineup.editIndex = index
                        this.lineup.action = 'edit'
                        this.lineup.data = this.lineupList[index]
                        this.lineup.title = this.lineupList[index].name
                        break
                    }
                }
            },
            addLineupRequest () {
                if (!this.lineup.title.length) {
                    this.$message.error('阵容名称不能为空')
                    return
                }
                this.loading.editSubmit = true
                let params = this.editLineUpData
                this.api('/services/fantasy/lineup_add.php', params ).then(req => {
                    if (req.code == 200) {
                        this.$message.success(req.message)
                        this.requestLineupList()
                        this.cancelEdit()
                    } else {
                        this.$message.error(req.message)
                    }
                    this.loading.editSubmit = false
                })
            },
            submitEditRequest (){
                if (!this.lineup.title.length) {
                    this.$message.error('阵容名称不能为空')
                    return
                }
                this.loading.editSubmit = true
                let params = this.editLineUpData
                if (this.lineup.action == 'edit') {
                    params.id = this.lineup.data.id
                }
                this.api('/services/fantasy/lineup_edit.php', params ).then(req => {
                    if (req.code == 200) {
                        this.$message.success(req.message)
                        this.requestLineupList()
                        this.cancelEdit()
                    } else {
                        this.$message.error(req.message)
                    }
                    this.editSubmit.dialog.show = false
                    this.loading.editSubmit = false
                })
            },
            requestPlayerList (pos) {
                if (this.playerList[pos].count > 0 && this.playerList[pos].list.length >= this.playerList[pos].count) return
                this.loading.playerList = true
                this.api('/services/fantasy/all_player_list.php', {positionID: pos, limit: 100}).then(req => {
                    if (req.code == 200) {
                        let _list = req.data.list
                        for (let i in _list) {
                            _list[i].pos = _list[i].positionID
                            _list[i].price = _list[i].value
                        }
                        this.playerList[pos].list = _list
                    }
                    this.loading.playerList = false
                })
            },
            requestLineupList () {
                this.loading.playerList = true
                this.api('/services/fantasy/lineup_list.php').then(req => {
                    if (req.code == 200) {
                        let list = req.data.list
                        for (let i in list) {
                            list[i].player_list = []
                            for (let key in this.pos.arr) {
                                let pos = this.pos.arr[key]
                                list[i].player_list.push(list[i][pos])
                                delete list[i][pos]
                            }
                        }
                        this.lineupList = list
                    }
                    this.loading.playerList = false
                })
            },
            changePosNav (pos) {
                if (this.lineup.action == '') {
                    this.lineup.action = 'create'
                }
                this.selectedPlayer = null
                this.pos.currPos = this.pos.obj[pos].positionID
            },
            removePosPlayer (item) {
                this.selectPlayer[item.positionID] = null
                this.pos.currPos = item.positionID
            },
            sortPlayer (type) {
                this.sort.type = type
                this.sort[type === 'price' ? 'score' : 'price'] = ''
                this.sort[type] = this.sort[type] === 'asc' ? 'desc' : 'asc'
            },
            closePlayerDetail () {
                this.selectedPlayer = null
            },
        }
    }
</script>

<style lang="stylus">
    @import "~static/css/lineup.styl"
</style>
