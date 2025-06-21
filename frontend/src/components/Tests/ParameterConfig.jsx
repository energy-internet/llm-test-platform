// src/components/Tests/ParameterConfig.jsx
import React from 'react'
import { Form, InputNumber, Input, Slider, Card, Row, Col } from 'antd'

const ParameterConfig = ({ config, onConfigChange }) => {
  const [form] = Form.useForm()

  const handleFormChange = (changedFields, allFields) => {
    const newConfig = { ...config }
    
    // 更新测试名称
    if (changedFields.name !== undefined) {
      newConfig.name = changedFields.name
    }
    
    // 更新参数
    const parameters = { ...newConfig.parameters }
    Object.keys(changedFields).forEach(key => {
      if (key !== 'name') {
        parameters[key] = changedFields[key]
      }
    })
    
    newConfig.parameters = parameters
    onConfigChange(newConfig)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3>配置测试参数</h3>
        <p style={{ color: '#666' }}>
          调整模型推理参数以获得最佳测试效果
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: config.name,
          ...config.parameters
        }}
        onValuesChange={handleFormChange}
      >
        <Card title="基本配置" style={{ marginBottom: 16 }}>
          <Form.Item
            name="name"
            label="测试名称"
            rules={[{ required: true, message: '请输入测试名称' }]}
          >
            <Input placeholder="例如：GPT-4模型ElecBench测试" />
          </Form.Item>
        </Card>

        <Card title="模型参数">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="temperature"
                label={`Temperature: ${config.parameters.temperature}`}
              >
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={config.parameters.temperature}
                  onChange={(value) => handleFormChange({ temperature: value })}
                />
              </Form.Item>
              
              <div style={{ color: '#666', fontSize: 12, marginTop: -16, marginBottom: 16 }}>
                控制输出的随机性，值越高越随机
              </div>
            </Col>

            <Col span={12}>
              <Form.Item
                name="top_p"
                label={`Top P: ${config.parameters.top_p}`}
              >
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={config.parameters.top_p}
                  onChange={(value) => handleFormChange({ top_p: value })}
                />
              </Form.Item>
              
              <div style={{ color: '#666', fontSize: 12, marginTop: -16, marginBottom: 16 }}>
                核采样参数，控制输出的多样性
              </div>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="max_tokens"
                label="最大输出长度"
              >
                <InputNumber
                  min={1}
                  max={4000}
                  value={config.parameters.max_tokens}
                  onChange={(value) => handleFormChange({ max_tokens: value })}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <div style={{ color: '#666', fontSize: 12, marginTop: -16, marginBottom: 16 }}>
                单次生成的最大token数量
              </div>
            </Col>

            <Col span={12}>
              <Form.Item
                name="timeout"
                label="超时时间 (秒)"
              >
                <InputNumber
                  min={10}
                  max={300}
                  value={config.parameters.timeout}
                  onChange={(value) => handleFormChange({ timeout: value })}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <div style={{ color: '#666', fontSize: 12, marginTop: -16, marginBottom: 16 }}>
                单个请求的最大等待时间
              </div>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="batch_size"
                label="批处理大小"
              >
                <InputNumber
                  min={1}
                  max={50}
                  value={config.parameters.batch_size}
                  onChange={(value) => handleFormChange({ batch_size: value })}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <div style={{ color: '#666', fontSize: 12, marginTop: -16, marginBottom: 16 }}>
                同时处理的测试用例数量
              </div>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  )
}

export default ParameterConfig