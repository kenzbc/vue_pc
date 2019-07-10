<template>
    <div id="page" class="404">
        <img src="/static/image/404.png" />
        <div class="actions">
            <el-button type="primary" @click="$router.go(-1)">回上一页</el-button>
            <el-button type="primary" @click="$router.push('/')">回首页</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {}
        }
    }
</script>

<style lang="stylus">
    #page {
        text-align center
        padding-top 10%

        img {
            max-width 100%
        }

        .actions {
            margin-top 50px
            margin-left -42px

            .el-button {
                height 40px
                line-height 38px
                padding 0 42px
                margin 0 13px
            }
        }
    }
</style>
