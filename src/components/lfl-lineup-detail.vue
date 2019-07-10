<template>
    <div class="lineup-detail-wrap">
        <div class="order-info">
            <div v-if="room.status != 0"><span>{{room.status == 4 ? '当前' : '最终'}}排名：</span><span class="light">{{team.order_rank}} / {{team.at_times}}</span></div>
            <div><span>阵容{{order.status != 2 ? '平均' : '积'}}分：</span><span class="light">{{team.avg_score}}</span></div>
            <div v-if="room.status == 0"><span>剩余工资：</span><span class="light price"><span>$<span>{{laveSalary(team.player_list)}}</span></span></span></div>
            <div v-if="room.status != 0 && room.status != 4" class="reward">
                <span>奖励：</span>
                <div v-if="room.prize_type == 1" :data-val="team.order_prize_amount" class="fruit"><lfl-icon icon="fruit"></lfl-icon></div>
                <div v-if="room.prize_type == 2" :data-val="team.order_prize_amount" class="ticket"><lfl-icon icon="ticket"></lfl-icon></div>
                <div v-if="room.prize_type == 3" class="other fix-bold-font">{{team.order_prize_amount}}</div>
            </div>
            <div v-if="room.status == 0" class="fr">
                <el-button class="join-button" :class="{'is-disabled': order.member_at_times >= room.times}" @click="joinRoom(order.member_at_times >= room.times)"><lfl-icon icon="add"></lfl-icon><span>{{order.member_at_times}} / {{room.times}}</span></el-button>
                <router-link :to="'/room/' + room.roomID + '/' + team.order_id"><el-button type="primary">编辑阵容</el-button></router-link>
            </div>
            <div class="close" v-if="type == 'detail'" @click="closeLineupDetail"></div>
        </div>
        <div class="clearfix"></div>
        <div class="player-list">
            <div class="list-item" v-for="(item,index) in team.player_list" :key="index">
                <div class="avatar" v-if="item" :style="{'background-image': 'url('+ (item.bg1 || '/static/image/bg1.png') +')' }" @click="$emit('playerDetail', item)">
                    <img v-if="item" :src="item.player_image || '/static/image/unknow.png'" />
                </div>
                <div class="info">
                    <div class="nickname"><span>{{item.nickname}}</span><span class="badge" :class="'status-' + item.player_status">{{item.player_status | playerStatus}}</span></div>
                    <div class="position">
                        <span class="price">$<span>{{item.value}}</span></span>
                        <!--<span class="pos"><lfl-icon :icon="'pos-' + item.position_short_name.toLowerCase()"></lfl-icon><span>{{item.team_short_name}}</span></span>-->
                    </div>
                    <div class="vs-team-list">
                        <div class="vs-team" v-for="(match,index) in item.match_info" :key="index" v-if="index < 2" :class="matchScoreClass(match)">{{match.score == '未开始' ? 'vs' : match.score}} {{match.vs_team}}</div>
                    </div>
                </div>
                <div class="avg-score" v-if="room.status == 0">
                    <lfl-line-chart class="chart" :avgScore="item.score" :scoreList="item.score_list" :id="item.id" :width="220"></lfl-line-chart>
                    <div class="score">平均分：{{order.room_status == 0 ? item.score : item.r_score}}</div>
                </div>
                <div class="price good" v-if="room.status == 0">$<span>{{item.value}}</span></div>
                <div class="data" v-if="room.status != 0">
                    <div class="row">
                        <div class="col">
                            <span class="key">击杀</span>
                            <span class="val">{{item.r_kills}}</span>
                        </div>
                        <div class="col">
                            <span class="key">死亡</span>
                            <span class="val">{{item.r_deaths}}</span>
                        </div>
                        <div class="col">
                            <span class="key">助攻</span>
                            <span class="val">{{item.r_assists}}</span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <span class="key">分均伤害</span>
                            <span class="val">{{item.r_demage_dealt_m}}</span>
                        </div>
                        <div class="col">
                            <span class="key">分均承伤</span>
                            <span class="val">{{item.r_demage_taken_m}}</span>
                        </div>
                        <div class="col">
                            <span class="key">分均视野</span>
                            <span class="val">{{item.r_sight_m}}</span>
                        </div>
                    </div>
                </div>
                <div class="score-box" v-if="room.status != 0">
                    <div class="box">
                        <div class="title fix-bold-font">{{playerScoreStatus(item.match_info)}}得分</div>
                        <div class="value">{{item.r_score}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            order: {
                type: Object
            },
            room: {
                type: Object
            },
            team: {
                type: Object
            },
            type: {
                type: String,
                default: ''
            }
        },
        data() {
            return {}
        },
        methods: {
            laveSalary (player_list) {
                let val = this.room.salary_cap
                for (let i in player_list) {
                    val -= player_list[i].value
                }
                return val
            },
            joinRoom (disabled) {
                if (disabled) {
                    this.$message.error('参与次数已达到上限')
                    return
                }
                this.$router.push('/room/' + this.order.roomID)
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
            closeLineupDetail () {
                this.$emit('closeLineupDetail')
            },
            matchScoreClass (match) {
                let cls =  {
                    'ing': match.status == 1,
                    'end': match.status == 2
                }
                return cls
            }
        }
    }
</script>

<style lang="stylus">

</style>