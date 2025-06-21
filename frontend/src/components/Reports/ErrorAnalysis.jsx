// src/components/Reports/ErrorAnalysis.jsx
import React, { useRef, useEffect } from 'react'
import { Card, Row, Col, List, Progress, Tag } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'

const ErrorAnalysis = ({ data = [] }) => {
  const pieChartRef = useRef(null)
  const trendChartRef = useRef(null)

  useEffect(() => {
    if (data.length === 0) return

    // 饼图
    if (pieChartRef.current) {
      const pieChart = echarts.init(pieChartRef.current)
      
      const pieOption = {
        title: {
          text: '错误类型分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '错误类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data.map(item => ({
              value: item.count,
              name: item.category,
              itemStyle: {
                color: getErrorColor(item.category)
              }
            }))
          }
        ]
      }
      
      pieChart.setOption(pieOption)
    }

    // 趋势图（模拟数据）
    if (trendChartRef.current) {
      const trendChart = echarts.init(trendChartRef.current)
      
      const trendOption = {
        title: {
          text: '错误趋势分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: data.map(item => item.category),
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: data.map(item => ({
          name: item.category,
          type: 'line',
          stack: 'Total',
          data: generateTrendData(item.count),
          itemStyle: {
            color: getErrorColor(item.category)
          }
        }))
      }
      
      trendChart.setOption(trendOption)
    }

    // 清理函数
    return () => {
      if (pieChartRef.current) {
        echarts.dispose(pieChartRef.current)
      }
      if (trendChartRef.current) {
        echarts.dispose(trendChartRef.current)
      }
    }
  }, [data])

  const getErrorColor = (category) => {
    const colorMap = {
      '语法错误': '#f5222d',
      '逻辑错误': '#fa8c16',
      '格式错误': '#fadb14',
      '其他错误': '#722ed1'
    }
    return colorMap[category] || '#666'
  }

  const generateTrendData = (baseCount) => {
    // 生成模拟的趋势数据
    const variation = baseCount * 0.3
    return [
      Math.max(0, baseCount + Math.random() * variation - variation / 2),
      Math.max(0, baseCount + Math.random() * variation - variation / 2),
      Math.max(0, baseCount + Math.random() * variation - variation / 2),
      Math.max(0, baseCount + Math.random() * variation - variation / 2)
    ].map(val => Math.round(val))
  }

  const getErrorSeverity = (percentage) => {
    if (percentage >= 40) return { color: 'red', text: '严重' }
    if (percentage >= 20) return { color: 'orange', text: '中等' }
    return { color: 'green', text: '轻微' }
  }

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        暂无错误分析数据
      </div>
    )
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card>
            <div ref={pieChartRef} style={{ width: '100%', height: 400 }}></div>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div ref={trendChartRef} style={{ width: '100%', height: 400 }}></div>
          </Card>
        </Col>
      </Row>
      
      <Card title="错误详情分析" style={{ marginTop: 16 }}>
        <List
          dataSource={data}
          renderItem={item => {
            const severity = getErrorSeverity(item.percentage)
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <ExclamationCircleOutlined 
                      style={{ 
                        fontSize: 20, 
                        color: getErrorColor(item.category) 
                      }} 
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong>{item.category}</strong>
                      <Tag color={severity.color}>{severity.text}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        出现次数: <strong>{item.count}</strong> 次
                      </div>
                      <Progress 
                        percent={item.percentage} 
                        strokeColor={getErrorColor(item.category)}
                        format={percent => `${percent}%`}
                      />
                    </div>
                  }
                />
              </List.Item>
            )
          }}
        />
      </Card>
    </div>
  )
}

export default ErrorAnalysis