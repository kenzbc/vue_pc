<template>
    <div class="v-circle fll" v-bind:style="circleStyle">
        <div class="mask full" v-bind:style="[maskStyle, transitionStyle, rotateStyle]">
            <div class="fill" v-bind:style="[fillStyle, transitionStyle, rotateStyle]"></div>
        </div>
        <div class="mask half" v-bind:style="[maskStyle]">
            <div class="fill" v-bind:style="[fillStyle, transitionStyle, rotateStyle]"></div>
            <div class="fill fix" v-bind:style="[fillStyle, fixStyle, transitionStyle]"></div>
        </div>
        <div class="pv" v-bind:style="pvStyle">
            <span class="progress" v-bind:style="progressTextStyle" :class="{other:text != ''}">{{ pv || 0 }}<br/><span v-if="text != ''">{{text}}</span></span>
        </div>
    </div>
</template>

<style>
    .v-circle {
        border-radius: 50%;
        position: relative;
        margin-left: 18px;
        margin-right: 18px;
        float: left
    }

    .v-circle .mask, .v-circle .fill {
        position: absolute;
        border-radius: 50%;
        backface-visibility: hidden;
    }

    .v-circle .pv {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        z-index: 1;
        border-radius: 50%;
        text-align: center;
    }

    .v-circle .pv .progress {
        margin: 0;
        padding: 0;
        font-family: 'Microsoft YaHei';
    }

    .v-circle .pv .other {
        display: block;
        font-size: 24px !important;
        color: #0c9dfc !important;
        line-height: 22px;
        margin: 20px 0 0 0;
    }

    .v-circle .pv .other span {
        color: #373A41;
        font-size: 12px;
    }
</style>

<script>
    const DEFAULT_WIDTH = 150
        , DEFAULT_BOLD = 7
        , DEFAULT_FONT_SIZE = 64
        , DEFAULT_BORDER_COLOR = '#ffcbcb'
        , DEFAULT_TEXT_COLOR = '#52545a'
        , DEFAULT_FILL_COLOR = '#2ecc71'
        , DEFAUTL_BG_COLOR = '#ffcbcb'
        , DEFAUTL_TEXT_BG_COLOR = '#333333'

    export default {

        methods: {

            setClip(t, r, b, l) {
                return `rect(${t}px, ${r}px, ${b}px, ${l}px)`
            },
            setTransformStyle(score, totalScore, type) {
                let deg = Math.floor((score / totalScore) * 180)
                if (type === 'fix') {

                    // remove the gap between two half circles
                    return `rotate(${deg * 2}deg)`
                }
                return `rotate(${deg}deg)`
            },
            setTransitionStyle(t) {
                return `transform ${t}s`
            },
        },

        props: [
            'color',
            'width',
            'fontSize',
            'pv',
            'textColor',
            'bold',
            'textBgColor',
            'borderColor',
            'during',
            'bgColor',
            'score',
            'totalScore',
            'text'
        ],

        data() {
            let _this = this;
            let transformStyleValue = this.setTransformStyle(this.score, this.totalScore)
                , innerCircleWidth = ((this.width || DEFAULT_WIDTH)
                - 2 * (this.bold || DEFAULT_BOLD))
                + 'px'

                , fixTransformStyleValue = this.setTransformStyle(this.score, this.totalScore, 'fix')
                , transitionStyleValue = this.setTransitionStyle(this.during || 0.8)
            return {
                // 环形样式
                scores: '',
                totalScores: '',
                circleStyle: {
                    borderColor: (this.borderColor || DEFAULT_BORDER_COLOR),
                    // borderStyle: 'solid',
                    borderWidth: DEFAULT_BOLD + 'px',
                    width: (this.width || DEFAULT_WIDTH) + 'px',
                    height: (this.width || DEFAULT_WIDTH) + 'px',
                    backgroundColor: (this.bgColor || DEFAUTL_BG_COLOR)
                },

                // 进度文字样式
                progressTextStyle: {
                    fontSize: (this.fontSize || DEFAULT_FONT_SIZE) + 'px',
                    color: this.textColor || DEFAULT_TEXT_COLOR
                },

                fillStyle: {
                    backgroundColor: this.color || DEFAULT_FILL_COLOR,
                    width: (this.width || DEFAULT_WIDTH) + 'px',
                    height: (this.width || DEFAULT_WIDTH) + 'px',
                    clip: this.setClip(0, this.width / 2, this.width, 0)
                },

                rotateStyle: {
                    transform: transformStyleValue,
                    webkitTransform: transformStyleValue,
                    msTransform: transformStyleValue,
                    oTransform: transformStyleValue,
                    mozTransform: transformStyleValue
                },

                transitionStyle: {
                    transition: transitionStyleValue,
                    webkitTransition: transitionStyleValue,
                    mozTransition: transitionStyleValue,
                    oTransition: transitionStyleValue,
                    msTransition: transitionStyleValue
                },

                maskStyle: {
                    width: (this.width || DEFAULT_WIDTH) + 'px',
                    height: (this.width || DEFAULT_WIDTH) + 'px',
                    clip: this.setClip(0, this.width, this.width, this.width / 2)
                },

                pvStyle: {
                    backgroundColor: this.textBgColor || DEFAUTL_TEXT_BG_COLOR,
                    width: innerCircleWidth,
                    height: innerCircleWidth,
                    lineHeight: innerCircleWidth
                },

                fixStyle: {
                    transform: fixTransformStyleValue,
                    webkitTransform: fixTransformStyleValue,
                    mozTransform: fixTransformStyleValue,
                    oTransform: fixTransformStyleValue,
                    msTransform: fixTransformStyleValue
                }
            }
        },

    }
</script>
