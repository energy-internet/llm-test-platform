// src/pages/TestCreation.jsx
import React, { useState, useEffect } from 'react'
import { Card, Steps, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useModelStore } from '../stores/modelStore'
import { useTestStore } from '../stores/testStore'
import ModelSelection from '../components/Tests/ModelSelection'
import BenchmarkSelection from '../components/Tests/BenchmarkSelection'
import ParameterConfig from '../components/Tests/ParameterConfig'
import TestConfirmation from '../components/Tests/TestConfirmation'

const TestCreation = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { providers, fetchProviders } = useModelStore()
  const { benchmarks, fetchBenchmarks, createTask } = useTestStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [testConfig, setTestConfig] = useState({
    name: '',
    selectedModels: [],
    selectedBenchmark: null,
    parameters: {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1.0,
      timeout: 60,
      batch_size: 10
    }
  })

  useEffect(() => {
    fetchProviders()
    fetchBenchmarks()
  }, [fetchProviders, fetchBenchmarks])

  const steps = [
    {
      title: '选择模型',
      content: 'model-selection'
    },
    {
      title: '选择基准测试',
      content: 'benchmark-selection'
    },
    {
      title: '配置参数',
      content: 'parameter-config'
    },
    {
      title: '确认创建',
      content: 'test-confirmation'
    }
  ]

  const handleNext = () => {
    if (currentStep === 0 && testConfig.selectedModels.length === 0) {
      message.warning('请至少选择一个模型')
      return
    }
    if (currentStep === 1 && !testConfig.selectedBenchmark) {
      message.warning('请选择一个基准测试')
      return
    }
    if (currentStep === 2 && !testConfig.name.trim()) {
      message.warning('请输入测试名称')
      return
    }
    
    setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    try {
      const taskData = {
        name: testConfig.name,
        benchmark_id: testConfig.selectedBenchmark.id,
        model_ids: testConfig.selectedModels.map(m => m.id),
        config: testConfig.parameters,
        status: 'pending',
        progress: 0
      }

      const result = await createTask(taskData)
      if (result.success) {
        message.success('测试任务创建成功！')
        navigate('/tests/queue')
      } else {
        message.error('创建失败: ' + result.error.message)
      }
    } catch (error) {
      message.error('创建失败: ' + error.message)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ModelSelection
            providers={providers}
            selectedModels={testConfig.selectedModels}
            onSelectionChange={(models) => 
              setTestConfig({ ...testConfig, selectedModels: models })
            }
          />
        )
      case 1:
        return (
          <BenchmarkSelection
            benchmarks={benchmarks}
            selectedBenchmark={testConfig.selectedBenchmark}
            onSelectionChange={(benchmark) => 
              setTestConfig({ ...testConfig, selectedBenchmark: benchmark })
            }
          />
        )
      case 2:
        return (
          <ParameterConfig
            config={testConfig}
            onConfigChange={setTestConfig}
          />
        )
      case 3:
        return (
          <TestConfirmation
            config={testConfig}
          />
        )
      default:
        return null
    }
  }

  return (
    <Card title="创建测试任务">
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />
      
      <div style={{ minHeight: 400, marginBottom: 24 }}>
        {renderStepContent()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          onClick={handlePrev} 
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        
        <div>
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleSubmit}>
              创建测试
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default TestCreation