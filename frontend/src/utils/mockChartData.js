// src/utils/mockChartData.js
export const generateMockChartData = (reportData) => {
  // Mock model names and data
  const modelNames = [
    'GPT-4 Turbo',
    'Claude-3 Opus',
    'Gemini Pro',
    'GPT-3.5 Turbo',
    'DeepSeek Chat',
    'Llama-2 70B',
    'Mistral Large'
  ];

  const topModels = modelNames.slice(0, 4);

  // Performance Comparison Data
  const performanceComparison = modelNames.map(model => ({
    model: model.length > 12 ? model.substring(0, 12) + '...' : model,
    accuracy: Math.random() * 20 + 75, // 75-95%
    precision: Math.random() * 15 + 80, // 80-95%
    recall: Math.random() * 20 + 70, // 70-90%
    f1_score: Math.random() * 18 + 77, // 77-95%
  }));

  // Response Time Analysis
  const responseTimeAnalysis = modelNames.map(model => ({
    model: model.length > 10 ? model.substring(0, 10) + '...' : model,
    avg_response_time: Math.random() * 3 + 0.5, // 0.5-3.5s
    success_rate: Math.random() * 10 + 90, // 90-100%
    throughput: Math.floor(Math.random() * 50 + 10), // 10-60 req/s
  }));

  // Time Series Data (last 30 days)
  const generateTimeSeriesData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dataPoint = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: date.toISOString().split('T')[0]
      };
      
      // Add performance data for each model with some realistic trends
      modelNames.forEach(model => {
        const basePerformance = 75 + Math.random() * 20;
        const trend = Math.sin(i * 0.1) * 5; // Some cyclical variation
        const noise = (Math.random() - 0.5) * 8; // Random noise
        dataPoint[model] = Math.max(60, Math.min(100, basePerformance + trend + noise));
      });
      
      data.push(dataPoint);
    }
    return data;
  };

  // Radar Chart Data
  const metrics = ['Accuracy', 'Speed', 'Cost Efficiency', 'Reliability', 'Scalability', 'Quality'];
  const radarData = metrics.map(metric => {
    const dataPoint = { metric };
    topModels.forEach(model => {
      dataPoint[model] = Math.random() * 30 + 70; // 70-100
    });
    return dataPoint;
  });

  // Score Distribution
  const scoreDistribution = [
    { name: 'Excellent (90-100)', count: Math.floor(Math.random() * 15 + 10), range: '90-100' },
    { name: 'Good (80-89)', count: Math.floor(Math.random() * 20 + 25), range: '80-89' },
    { name: 'Fair (70-79)', count: Math.floor(Math.random() * 15 + 15), range: '70-79' },
    { name: 'Poor (60-69)', count: Math.floor(Math.random() * 10 + 5), range: '60-69' },
    { name: 'Failed (<60)', count: Math.floor(Math.random() * 5 + 2), range: '<60' }
  ];

  // Confusion Matrix Data
  const confusionMatrixData = topModels.slice(0, 6).map(model => ({
    model: model,
    matrix: {
      tp: Math.floor(Math.random() * 20 + 80), // True Positives
      fp: Math.floor(Math.random() * 15 + 5),  // False Positives
      fn: Math.floor(Math.random() * 15 + 5),  // False Negatives
      tn: Math.floor(Math.random() * 20 + 80)  // True Negatives
    }
  }));

  // ROC Curve Data
  const generateROCData = () => {
    const data = [];
    for (let i = 0; i <= 100; i += 5) {
      const fpr = i / 100;
      const dataPoint = {
        fpr: fpr,
        random: fpr // Random classifier baseline
      };
      
      // Generate ROC curves for top models
      topModels.forEach(model => {
        // Simulate realistic ROC curves (better than random)
        const modelKey = model.replace(/\s+/g, '_');
        const baseTPR = Math.sqrt(fpr) + (Math.random() * 0.1 - 0.05);
        const modelVariation = (Math.random() * 0.2 + 0.8); // 0.8-1.0 multiplier
        dataPoint[modelKey] = Math.min(1, Math.max(0, baseTPR * modelVariation + 0.1));
      });
      
      data.push(dataPoint);
    }
    return data;
  };

  // AUC Scores
  const aucScores = {};
  topModels.forEach(model => {
    aucScores[model] = Math.random() * 0.15 + 0.82; // 0.82-0.97
  });

  // Cost vs Performance Analysis
  const costPerformanceData = modelNames.map(model => {
    const performance = Math.random() * 25 + 70; // 70-95
    const cost = Math.random() * 0.05 + 0.001; // $0.001-$0.051 per 1K tokens
    return {
      model: model,
      performance_score: performance,
      cost_per_1k: cost,
      efficiency_ratio: performance / (cost * 1000) // Performance per dollar
    };
  });

  // Detailed Metrics Table
  const detailedMetrics = modelNames.map(model => ({
    model: model,
    accuracy: Math.random() * 20 + 75,
    precision: Math.random() * 0.2 + 0.8,
    recall: Math.random() * 0.2 + 0.75,
    f1_score: Math.random() * 0.2 + 0.78,
    auc: Math.random() * 0.15 + 0.82,
    response_time: Math.random() * 3 + 0.5,
    cost_per_1k: Math.random() * 0.05 + 0.001,
    throughput: Math.floor(Math.random() * 50 + 10)
  }));

  // Test Case Results Over Time
  const testResultsOverTime = [];
  for (let i = 0; i < 24; i++) {
    testResultsOverTime.push({
      hour: `${i}:00`,
      passed: Math.floor(Math.random() * 50 + 150),
      failed: Math.floor(Math.random() * 20 + 5),
      skipped: Math.floor(Math.random() * 10 + 2)
    });
  }

  return {
    modelNames,
    topModels,
    performanceComparison,
    responseTimeAnalysis,
    timeSeriesData: generateTimeSeriesData(),
    radarData,
    scoreDistribution,
    confusionMatrixData,
    rocCurveData: generateROCData(),
    aucScores,
    costPerformanceData,
    detailedMetrics,
    testResultsOverTime
  };
};

// Additional utility functions for chart data manipulation
export const filterDataByTimeRange = (data, timeRange) => {
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (timeRange) {
    case '1d':
      cutoffDate.setDate(now.getDate() - 1);
      break;
    case '7d':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      cutoffDate.setDate(now.getDate() - 90);
      break;
    default:
      cutoffDate.setDate(now.getDate() - 7);
  }
  
  return data.filter(item => new Date(item.timestamp) >= cutoffDate);
};

export const calculateStatistics = (data, metric) => {
  const values = data.map(item => item[metric]).filter(val => typeof val === 'number');
  
  if (values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    min: Math.min(...values),
    max: Math.max(...values),
    stdDev: parseFloat(stdDev.toFixed(2)),
    count: values.length
  };
};

export const generateComparisonInsights = (data) => {
  const insights = [];
  
  // Find best performing model
  const bestModel = data.performanceComparison.reduce((best, current) => 
    current.accuracy > best.accuracy ? current : best
  );
  insights.push(`🏆 ${bestModel.model} achieved the highest accuracy at ${bestModel.accuracy.toFixed(1)}%`);
  
  // Find most cost-effective model
  const mostEfficient = data.costPerformanceData.reduce((best, current) => 
    current.efficiency_ratio > best.efficiency_ratio ? current : best
  );
  insights.push(`💰 ${mostEfficient.model} offers the best value with ${mostEfficient.efficiency_ratio.toFixed(1)} performance points per dollar`);
  
  // Find fastest model
  const fastest = data.responseTimeAnalysis.reduce((best, current) => 
    current.avg_response_time < best.avg_response_time ? current : best
  );
  insights.push(`⚡ ${fastest.model} is the fastest with ${fastest.avg_response_time.toFixed(2)}s average response time`);
  
  return insights;
};