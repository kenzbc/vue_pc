<template>
    <div id="ranking">
        <div class="container clearfix">
            <lfl-rank-list title="周榜" type="blue" :data="week.data" v-loading="week.loading" @scrollDown="scrollDown('week')" element-loading-text="拼命加载中"></lfl-rank-list>
            <lfl-rank-list title="月榜" type="violet" :data="month.data" v-loading="month.loading" @scrollDown="scrollDown('month')" element-loading-text="拼命加载中"></lfl-rank-list>
            <lfl-rank-list title="总榜" type="red" :data="total.data" v-loading="total.loading" @scrollDown="scrollDown('total')" element-loading-text="拼命加载中"></lfl-rank-list>
        </div>
        <!--<lfl-footer></lfl-footer>-->
    </div>
</template>

<script>
    export default {
        data () {
            return {
                week: {
                    data: {list:[],me:{}},
                    lastCount: 0,
                    page: 1,
                    end: false,
                    loading: true
                },
                month: {
                    data: {list:[],me:{}},
                    lastCount: 0,
                    page: 1,
                    end: false,
                    loading: true
                },
                total: {
                    data: {list:[],me:{}},
                    lastCount: 0,
                    page: 1,
                    end: false,
                    loading: true
                }
            }
        },
        mounted () {
            this.requestList()
            document.title = '排行榜';
        },
        watch: {
            '$store.state.member.info' () {
                this.requestList ()
            }
        },
        methods: {
            scrollDown(type) {
                let data = this[type]
                if (data.loading || !data.data.list.length || data.lastCount != 100) return
                data.page++
                this.requestList(type)
            },
            requestList (type) {
                if (type) {
                    this.requestRankList(type)
                } else {
                    let types = ['week','month','total']
                    for (let i in types) {
                        this.requestRankList(types[i])
                    }
                }
            },
            requestRankList (type) {
                this[type].loading = true
                this.api('/services/fantasy/fantasy_rank_list.php',{type: type, limit: 100, page: this[type].page}).then(req => {
                    if (req.code == 200) {
                        let list = req.data.list
                        for (let i in list) {
                            this[type].data.list.push(list[i])
                        }

                        if (!this[type].data.period) {
                            this[type].data.period = req.data.period
                            this[type].data.update = req.data.update
                            this[type].data.me = req.data.me
                        }
                        this[type].lastCount = list.length
                        this[type].loading = false
                    }
                })
            }
        }
    }
</script>

<style lang="stylus">
    #ranking {
        margin-top 40px
        .rank-list {
            float left

            + .rank-list {
                margin-left 12px
            }
        }

        .remark {
            text-align center
            font-size: 14px;
            color: #A5A8B2;
            margin-top 12px
        }
    }
</style>
