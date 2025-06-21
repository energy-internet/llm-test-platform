// src/components/Reports/ModelComparison.jsx
import React, { useRef, useEffect } from 'react'
import { Card, Row, Col, Table, Tag } from 'antd'
import * as echarts from 'echarts'

const ModelComparison = ({ data = [] }) => {
  const radarChartRef = useRef(null)
  const barChartRef = useRef(null)

  useEffect(() => {
    if (data.length === 0) return

    // 雷达图
    if (radarChartRef.current) {
      const radarChart = echarts.init(radarChartRef.current)
      
      const radarOption = {
        title: {
          text: '模型多维度对比',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        radar: {
          indicator: [
            { name: '准确率', max: 100 },
            { name: '速度', max: 10 },
            { name: '成本效益', max: 10 },
            { name: '稳定性', max: 100 },
            { name: '创新性', max: 100 }
          ],
          shape: 'polygon',
          splitNumber: 4,
          name: {
            textStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(25,144,255,0.1)', 'rgba(25,144,255,0.05)']
            }
          }
        },
        series: [{
          name: '模型对比',
          type: 'radar',
          data: data.map(item => ({
            value: [
              item.accuracy,
              item.speed,
              item.cost,
              Math.random() * 100, // 模拟稳定性数据
              Math.random() * 100  // 模拟创新性数据
            ],
            name: item.model,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2
            },
            areaStyle: {
              opacity: 0.1
            }
          }))
        }]
      }
      
      radarChart.setOption(radarOption)
    }

    // 柱状图
    if (barChartRef.current) {
      const barChart = echarts.init(barChartRef.current)
      
      const barOption = {
        title: {
          text: '模型性能指标对比',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['准确率', '速度', '成本效益'],
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
          data: data.map(item => item.model),
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
        series: [
          {
            name: '准确率',
            type: 'bar',
            data: data.map(item => item.accuracy),
            itemStyle: {
              color: '#1890ff'
            }
          },
          {
            name: '速度',
            type: 'bar',
            data: data.map(item => item.speed),
            itemStyle: {
              color: '#52c41a'
            }
          },
          {
            name: '成本效益',
            type: 'bar',
            data: data.map(item => item.cost),
            itemStyle: {
              color: '#fa8c16'
            }
          }
        ]
      }
      
      barChart.setOption(barOption)
    }

    // 清理函数
    return () => {
      if (radarChartRef.current) {
        echarts.dispose(radarChartRef.current)
      }
      if (barChartRef.current) {
        echarts.dispose(barChartRef.current)
      }
    }
  }, [data])

  const tableColumns = [
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (value) => (
        <Tag color={value >= 90 ? 'green' : value >= 80 ? 'orange' : 'red'}>
          {value}%
        </Tag>
      ),
      sorter: (a, b) => a.accuracy - b.accuracy
    },
    {
      title: '速度评分',
      dataIndex: 'speed',
      key: 'speed',
      render: (value) => (
        <Tag color={value >= 9 ? 'green' : value >= 7 ? 'orange' : 'red'}>
          {value}/10
        </Tag>
      ),
      sorter: (a, b) => a.speed - b.speed
    },
    {
      title: '成本效益',
      dataIndex: 'cost',
      key: 'cost',
      render: (value) => (
        <Tag color={value >= 8 ? 'green' : value >= 6 ? 'orange' : 'red'}>
          {value}/10
        </Tag>
      ),
      sorter: (a, b) => a.cost - b.cost
    }
  ]

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        暂无对比数据
      </div>
    )
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card>
            <div ref={radarChartRef} style={{ width: '100%', height: 400 }}></div>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div ref={barChartRef} style={{ width: '100%', height: 400 }}></div>
          </Card>
        </Col>
      </Row>
      
      <Card title="详细数据对比" style={{ marginTop: 16 }}>
        <Table
          columns={tableColumns}
          dataSource={data}
          rowKey="model"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  )
}

export default ModelComparison