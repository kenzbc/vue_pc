<template>
    <div :id="'chart-' + id"></div>
</template>

<script>
    import Highcharts from 'highcharts'
    export default {
        props: {
            id: {
                type: [String,Number]
            },
            avgScore: {
                type: [String,Number],
                default: 0
            },
            scoreList: {
                type: Array
            },
            width: {
                type: [String,Number],
                default: 180
            },
            height: {
                type: [String,Number],
                default: 70
            }
        },
        computed: {
            trendLine () {
                let arr = []
                for (let i = 0;i <= 9;i++) {
                    arr[i] = this.scoreList[i] ? this.scoreList[i] - this.avgScore : this.avgScore
                }
                return arr
            }
        },
        mounted () {
            this.init()
        },
        updated () {
            this.init()
        },
        methods: {
            init () {
                this.target = Highcharts.chart({
                    chart: {
                        renderTo: 'chart-' + this.id,
                        type: 'area',
                        width: this.width,
                        height: this.height,
                        padding: 0,
                        backgroundColor: '#fff',
                    },
                    title: {
                        text: null
                    },
                    xAxis: {
                        gridLineWidth: '0px',
                        tickWidth: 0,
                        lineColor: '#fff',
                        labels: {
                            enabled: false
                        }
                    },
                    tooltip: {
                        enabled: false,
                    },
                    yAxis: {
                        title: {
                            text: ''
                        },
                        gridLineWidth: '0px',
                        tickWidth: 0,
                        labels: {
                            enabled: false
                        },
                        startOnTick: false
                    },
                    plotOptions: {
                        area: {
                            fillOpacity: 0
                        },
                    },
                    credits: {
                        enabled: false     //不显示LOGO
                    },
                    exporting: {
                        enabled: false
                    },
                    legend: {
                        enabled: false,
                        verticalAlign: 'middle'
                    },
                    series: [{
                        name: '',
                        lineColor: '#0C9DFC',
                        border: 1,
                        lineWidth: 1,
                        data: this.trendLine,
                        type: 'area',
                        states: {
                            hover: {
                                enabled: false
                            }
                        },
                        marker: {
                            radius: 3,
                            fillColor: '#fff',
                            symbol: 'circle',
                            lineColor: '#0C9DFC',
                            lineWidth: 1,
                            states: {
                                hover: {
                                }
                            }
                        },
                        animation: {
                            duration: 600,
                            easing: 'easeOutBounce'
                        },
                        selected: null
                    }, {
                        name: '',
                        lineWidth: 1,
                        animation: {
                            duration: 300,
                            easing: 'easeOutBounce'
                        },
                        data: [0,0,0,0,0,0,0,0,0,0],
                        lineColor: '#0C9DFC',
                        type: 'line',
                        dashStyle: 'dash',
                        states: {
                            hover: {
                                enabled: false
                            }
                        },
                        marker: {
                            fillColor: '#fff',
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: false
                                }
                            }
                        },
                        selected: null
                    }]
                })
            }
        }
    }
</script>

<style lang="stylus">
</style>
