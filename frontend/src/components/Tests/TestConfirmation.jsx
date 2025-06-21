// src/components/Tests/TestConfirmation.jsx
import React from 'react'
import { Card, Descriptions, Tag, Space, Alert } from 'antd'
import { ApiOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons'

const TestConfirmation = ({ config }) => {
  const getProviderColor = (type) => {
    const colorMap = {
      openai: '#10a37f',
      anthropic: '#d4a574',
      google: '#4285f4',
      huggingface: '#ff6b35',
      ollama: '#2563eb',
      deepseek: '#722ed1',
      custom: '#666666'
    }
    return colorMap[type] || '#666666'
  }

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

  const estimateTestTime = () => {
    const modelCount = config.selectedModels.length
    const batchSize = config.parameters.batch_size
    const estimatedCases = 100 // 假设每个基准测试有100个测试用例
    const timePerCase = 30 // 假设每个测试用例需要30秒
    
    const totalTime = Math.ceil((estimatedCases * modelCount * timePerCase) / batchSize / 60)
    return totalTime
  }

  const estimateCost = () => {
    const modelCount = config.selectedModels.length
    const estimatedTokens = 50000 // 假设总token消耗
    const costPerModel = (estimatedTokens / 1000) * 0.03 // 假设每1k token 0.03美元
    
    return (modelCount * costPerModel).toFixed(2)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3>确认测试配置</h3>
        <p style={{ color: '#666' }}>
          请仔细检查以下配置信息，确认无误后即可创建测试任务
        </p>
      </div>

      <Alert
        message="测试预估"
        description={
          <div>
            <p>预计测试时间: <strong>{estimateTestTime()} 分钟</strong></p>
            <p>预计成本: <strong>${estimateCost()}</strong></p>
            <p>测试将在后台异步执行，您可以在任务队列中查看进度</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title={<Space><SettingOutlined />基本信息</Space>} style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="middle">
          <Descriptions.Item label="测试名称">
            <strong>{config.name || '未命名测试'}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="选择模型">
            <Space wrap>
              {config.selectedModels.map(model => (
                <Tag 
                  key={model.id}
                  color={getProviderColor(model.provider_type)}
                  style={{ marginBottom: 4 }}
                >
                  {model.name}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="基准测试">
            {config.selectedBenchmark ? (
              <Space>
                <FileTextOutlined style={{ color: getBenchmarkTypeColor(config.selectedBenchmark.benchmark_type) }} />
                <strong>{config.selectedBenchmark.name}</strong>
                <Tag color={getBenchmarkTypeColor(config.selectedBenchmark.benchmark_type)}>
                  {config.selectedBenchmark.benchmark_type?.toUpperCase()}
                </Tag>
              </Space>
            ) : (
              <span style={{ color: '#999' }}>未选择</span>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={<Space><ApiOutlined />参数配置</Space>}>
        <Descriptions column={2} size="middle">
          <Descriptions.Item label="Temperature">
            <Tag color="blue">{config.parameters.temperature}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Top P">
            <Tag color="green">{config.parameters.top_p}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="最大输出长度">
            <Tag color="orange">{config.parameters.max_tokens} tokens</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="超时时间">
            <Tag color="red">{config.parameters.timeout} 秒</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="批处理大小">
            <Tag color="purple">{config.parameters.batch_size}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Alert
        message="注意事项"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>测试过程中请勿关闭浏览器，任务将在后台继续执行</li>
            <li>大型测试可能需要较长时间，请耐心等待</li>
            <li>如需取消测试，请在任务队列中操作</li>
            <li>测试完成后将自动生成详细报告</li>
          </ul>
        }
        type="warning"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  )
}

export default TestConfirmation