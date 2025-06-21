// src/components/Tests/BenchmarkSelection.jsx
import React from 'react'
import { Card, Radio, Upload, Button, Empty, Tag } from 'antd'
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons'

const BenchmarkSelection = ({ benchmarks, selectedBenchmark, onSelectionChange }) => {
  const getBenchmarkTypeColor = (type) => {
    const colorMap = {
      elec: '#722ed1',
      engi: '#1890ff',
      qa: '#52c41a',
      math: '#fa8c16',
      code: '#f5222d'
    }
    return colorMap[type] || '#666'
  }

  const getBenchmarkTypeLabel = (type) => {
    const labelMap = {
      elec: '电力行业',
      engi: '工程领域',
      qa: '问答测试',
      math: '数学推理',
      code: '代码生成'
    }
    return labelMap[type] || type
  }

  const handleUpload = (info) => {
    // 处理自定义基准测试上传
    console.log('上传文件:', info)
  }

  if (!benchmarks || benchmarks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Empty 
          description="暂无可用基准测试"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3>选择基准测试</h3>
        <p style={{ color: '#666' }}>
          选择一个基准测试来评估模型性能
        </p>
      </div>

      <Radio.Group
        value={selectedBenchmark?.id}
        onChange={(e) => {
          const benchmark = benchmarks.find(b => b.id === e.target.value)
          onSelectionChange(benchmark)
        }}
        style={{ width: '100%' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
          {benchmarks.map(benchmark => (
            <Card
              key={benchmark.id}
              size="small"
              style={{
                cursor: 'pointer',
                border: selectedBenchmark?.id === benchmark.id ? 
                  `2px solid ${getBenchmarkTypeColor(benchmark.benchmark_type)}` : 
                  '1px solid #d9d9d9'
              }}
              onClick={() => onSelectionChange(benchmark)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Radio
                  value={benchmark.id}
                  onClick={(e) => e.stopPropagation()}
                />
                <FileTextOutlined 
                  style={{ 
                    fontSize: 24, 
                    color: getBenchmarkTypeColor(benchmark.benchmark_type),
                    marginTop: 4
                  }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    {benchmark.name}
                  </div>
                  <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                    {benchmark.description}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Tag color={getBenchmarkTypeColor(benchmark.benchmark_type)}>
                      {getBenchmarkTypeLabel(benchmark.benchmark_type)}
                    </Tag>
                    <span style={{ color: '#999', fontSize: 12 }}>
                      {benchmark.config?.difficulty && `难度: ${benchmark.config.difficulty}`}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Radio.Group>

      <Card 
        style={{ marginTop: 24, borderStyle: 'dashed' }}
        bodyStyle={{ textAlign: 'center', padding: '24px' }}
      >
        <div style={{ marginBottom: 16 }}>
          <h4>上传自定义基准测试</h4>
          <p style={{ color: '#666', margin: 0 }}>
            支持JSON、CSV格式的测试数据
          </p>
        </div>
        <Upload
          accept=".json,.csv"
          showUploadList={false}
          beforeUpload={() => false}
          onChange={handleUpload}
        >
          <Button icon={<UploadOutlined />}>
            选择文件上传
          </Button>
        </Upload>
      </Card>
    </div>
  )
}

export default BenchmarkSelection