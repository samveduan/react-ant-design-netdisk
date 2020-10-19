import React, { Component } from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { Affix, Button } from 'antd';
import echarts from 'echarts'
import './monitor.less'

const { Countdown } = Statistic;
const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30; // Moment is also OK

export default class monitor extends Component {
    componentDidMount() {
        let myChart = echarts.init(document.getElementById('chart-container'));
        myChart.setOption(this.getOption());

        let myProportionChart = echarts.init(document.getElementById('proportion-chart-container'));
        myProportionChart.setOption(this.getProportionChartOption());

        let myForecastChart = echarts.init(document.getElementById('forecast-chart-container'));
        myForecastChart.setOption(this.getForecastChartOption());

        let myRateChart = echarts.init(document.getElementById('rate-chart-container'));

        setTimeout(function () {
            myChart.resize();
            myProportionChart.resize();
            myForecastChart.resize();
        }, 100)

        let _this = this;

        function startChart() {
            let option = _this.getRateChartOption();
            option.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
            myRateChart.setOption(option, true);
        }

        startChart();

        setInterval(function () {
            startChart();
        }, 2000);
    }

    getOption = () => {
        var upColor = '#ec0000';
        var upBorderColor = '#8A0000';
        var downColor = '#00da3c';
        var downBorderColor = '#008F28';

        var dataCount = 2e5;
        var data = generateOHLC(dataCount);

        return {
            dataset: {
                source: data
            },
            title: {
                text: 'Data Amount: ' + echarts.format.addCommas(dataCount)
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                }
            },
            grid: [
                {
                    left: 40,
                    right: 0,
                    bottom: 200
                },
                {
                    left: 40,
                    right: 0,
                    height: 80,
                    bottom: 80
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    scale: true,
                    boundaryGap: false,
                    // inverse: true,
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false }
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 10,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    bottom: 10,
                    start: 10,
                    end: 100,
                    handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '105%'
                }
            ],
            visualMap: {
                show: false,
                seriesIndex: 1,
                dimension: 6,
                pieces: [{
                    value: 1,
                    color: upColor
                }, {
                    value: -1,
                    color: downColor
                }]
            },
            series: [
                {
                    type: 'candlestick',
                    itemStyle: {
                        color: upColor,
                        color0: downColor,
                        borderColor: upBorderColor,
                        borderColor0: downBorderColor
                    },
                    encode: {
                        x: 0,
                        y: [1, 4, 3, 2]
                    }
                },
                {
                    name: 'Volumn',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        color: '#7fbe9e'
                    },
                    large: true,
                    encode: {
                        x: 0,
                        y: 5
                    }
                }
            ]
        };

        function generateOHLC(count) {
            var data = [];

            var xValue = +new Date(2011, 0, 1);
            var minute = 60 * 1000;
            var baseValue = Math.random() * 12000;
            var boxVals = new Array(4);
            var dayRange = 12;

            for (var i = 0; i < count; i++) {
                baseValue = baseValue + Math.random() * 20 - 10;

                for (var j = 0; j < 4; j++) {
                    boxVals[j] = (Math.random() - 0.5) * dayRange + baseValue;
                }
                boxVals.sort();

                var openIdx = Math.round(Math.random() * 3);
                var closeIdx = Math.round(Math.random() * 2);
                if (closeIdx === openIdx) {
                    closeIdx++;
                }
                var volumn = boxVals[3] * (1000 + Math.random() * 500);

                // ['open', 'close', 'lowest', 'highest', 'volumn']
                // [1, 4, 3, 2]
                data[i] = [
                    echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', xValue += minute),
                    +boxVals[openIdx].toFixed(2), // open
                    +boxVals[3].toFixed(2), // highest
                    +boxVals[0].toFixed(2), // lowest
                    +boxVals[closeIdx].toFixed(2),  // close
                    volumn.toFixed(0),
                    getSign(data, i, +boxVals[openIdx], +boxVals[closeIdx], 4) // sign
                ];
            }

            return data;

            function getSign(data, dataIndex, openVal, closeVal, closeDimIdx) {
                var sign;
                if (openVal > closeVal) {
                    sign = -1;
                }
                else if (openVal < closeVal) {
                    sign = 1;
                }
                else {
                    sign = dataIndex > 0
                        // If close === open, compare with close of last record
                        ? (data[dataIndex - 1][closeDimIdx] <= closeVal ? 1 : -1)
                        // No record of previous, set to be positive
                        : 1;
                }

                return sign;
            }
        }
    }

    getProportionChartOption = () => {
        let data = [{
            name: 'Apples',
            value: 70
        }, {
            name: 'Strawberries',
            value: 68
        }, {
            name: 'Bananas',
            value: 48
        }, {
            name: 'Oranges',
            value: 40
        }, {
            name: 'Pears',
            value: 32
        }, {
            name: 'Pineapples',
            value: 27
        }, {
            name: 'Grapes',
            value: 18
        }];

        return {
            series: [{
                type: 'pie',
                radius: '50%',
                center: ['50%', '50%'],
                data: data,
                animation: true,
                label: {
                    position: 'outer',
                    alignTo: 'none',
                    bleedMargin: 5
                },
                left: 0,
                right: '66.6667%',
                top: -50,
                bottom: 0
            }, {
                type: 'pie',
                radius: '50%',
                center: ['50%', '50%'],
                data: data,
                animation: true,
                label: {
                    position: 'outer',
                    alignTo: 'none',
                    bleedMargin: 5
                },
                left: '43.3333%',
                right: '33.3333%',
                top: -50,
                bottom: 0
            }, {
                type: 'pie',
                radius: '50%',
                center: ['50%', '50%'],
                data: data,
                animation: true,
                label: {
                    position: 'outer',
                    alignTo: 'none',
                    margin: 20
                },
                left: '76.6667%',
                right: 0,
                top: -50,
                bottom: 0
            }]
        };
    }

    getForecastChartOption = () => {
        return {
            grid: {
                x: 25,
                y: -10,
                x2: 0,
                y2: 20
            },
            xAxis: {
                type: 'category',
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '30%']
            },
            visualMap: {
                type: 'piecewise',
                show: false,
                dimension: 0,
                seriesIndex: 0,
                pieces: [{
                    gt: 1,
                    lt: 3,
                    color: 'rgba(0, 180, 0, 0.5)'
                }, {
                    gt: 5,
                    lt: 7,
                    color: 'rgba(0, 180, 0, 0.5)'
                }]
            },
            series: [
                {
                    type: 'line',
                    smooth: 0.6,
                    symbol: 'none',
                    lineStyle: {
                        color: 'green',
                        width: 5
                    },
                    markLine: {
                        symbol: ['none', 'none'],
                        label: { show: false },
                        data: [
                            { xAxis: 1 },
                            { xAxis: 3 },
                            { xAxis: 5 },
                            { xAxis: 7 }
                        ]
                    },
                    areaStyle: {},
                    data: [
                        ['2019-10-10', 200],
                        ['2019-10-11', 400],
                        ['2019-10-12', 650],
                        ['2019-10-13', 500],
                        ['2019-10-14', 250],
                        ['2019-10-15', 300],
                        ['2019-10-16', 450],
                        ['2019-10-17', 300],
                        ['2019-10-18', 100]
                    ]
                }
            ]
        };
    }

    getRateChartOption = () => {
        return {
            grid: {
                x: 25,
                y: -10,
                x2: 45,
                y2: 20
            },
            title: {  //标题组件
                text: '',
                textStyle: {
                    color: '#000',  //文字颜色
                    fontStyle: 'normal',  //字体风格：'normal','italic','oblique'
                    fontWeight: 'normal', //字体粗细 ：'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                    fontFamily: 'sans-serif',//字体系列： 'serif' , 'monospace', 'Arial', 'Courier New', 'Microsoft YaHei', ...
                    fontSize: 12, //字体大小
                },
                x: 'center',
                top: '66%',
            },
            tooltip: {
                formatter: '{a} <br/>{b} : {c}%'
            },
            series: [
                {
                    pointer: {
                        width: 5,//指针的宽度
                        length: "60%", //指针长度，按照半圆半径的百分比
                        shadowColor: '#ccc', //默认透明
                        shadowBlur: 5
                    },
                    name: '分区(/)使用率',
                    radius: '90%',
                    axisLine: {      //仪表盘轴线相关配置
                        show: true,
                        lineStyle: {
                            color: [  //仪表盘背景颜色渐变
                                [0.6, "#289728"],
                                [0.8, "#ff7300"],
                                [1, "#FF0000"]
                            ],
                            width: 12,  //轴线宽度
                        },
                    },
                    axisLabel: {  // 刻度标签
                        show: false,
                        fontSize: 10,   //改变仪表盘内刻度数字的大小
                        shadowColor: '#000', //默认透明
                        distance: -12
                    },
                    type: 'gauge',
                    detail: {				// 仪表盘详情，用于显示数据。
                        show: true,				// 是否显示详情,默认 true。
                        offsetCenter: [0, "43%"],// 相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
                        color: '#000000',
                        fontWeight: '700',
                        fontSize: '14',
                        formatter: '{value}%',	// 格式化函数或者字符串
                    },
                    data: [{ value: 50, name: '跳出率' }]
                }
            ]
        };
    }

    render() {
        return (
            <div>
                <Row gutter={24}>
                    <Col span={18}>
                        <Card title="活动实时交易情况" style={{ width: '100%' }}>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Statistic title="今日交易总额" value={124543233} suffix="元" />
                                </Col>
                                <Col span={6}>
                                    <Statistic title="销售目标完成率" value={92} suffix="%" />
                                </Col>
                                <Col span={6}>
                                    <Countdown title="活动剩余时间" value={deadline} format="HH:mm:ss:SSS" />
                                </Col>
                                <Col span={6}>
                                    <Statistic title="每秒交易总额" value={234} suffix="元" />
                                </Col>
                            </Row>

                            <Row>
                                <Col span={24}>
                                    <div>
                                        <div style={{ height: 400, paddingTop: 30, paddingRight: 20, overflow: 'hidden' }} id="chart-container"></div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        <div style={{ marginBottom: 15 }}></div>

                        <Card title="各品类占比" style={{ width: '100%' }}>
                            <Row>
                                <Col span={24}>
                                    <div style={{ height: 230, paddingRight: 150 }} id="proportion-chart-container"></div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col span={6}>
                        <Card title="活动情况预测" style={{ width: '100%', marginBottom: 15 }}>
                            <div style={{ height: 200, paddingTop: 10 }} id="forecast-chart-container"></div>
                        </Card>

                        <Card title="券核效率" style={{ width: '100%' }}>
                            <div style={{ height: 200 }} id="rate-chart-container"></div>
                        </Card>
                    </Col>
                </Row>

                <Affix offsetTop={100} onChange={affixed => console.log(affixed)}>
                    <Button>120px to affix top</Button>
                </Affix>
            </div>
        )
    }
}
