<template>
    <div id="null" :style="{paddingTop: padding + 'px',paddingBottom: padding + 'px'}">
        <img class="bg" src="/static/image/null.png" :style="{width: width + 'px'}" />
        <p>{{text}}</p>
    </div>
</template>

<script>
    export default {
        props: {
            text: {
                type: String,
                default: '暂无数据'
            },
            padding: {
                type: [Number,String],
                default: 100
            },
            width: {
                type: [Number,String],
                default: 328
            }
        }
    }
</script>

<style lang="stylus">
    #null {
        .bg {
            display block
            margin 0 auto
            height auto
        }

        p {
            font-size 16px
            text-align center
            color #A5A8B2
        }
    }
</style>
