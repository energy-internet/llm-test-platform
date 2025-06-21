// src/components/Reports/ReportCharts.jsx
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { generateMockChartData } from '../../utils/mockChartData';

const ReportCharts = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedModels, setSelectedModels] = useState([]);

  // Generate comprehensive mock data for visualizations
  const chartData = useMemo(() => generateMockChartData(data), [data]);

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0080', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleModelSelection = (modelName) => {
    setSelectedModels(prev => 
      prev.includes(modelName) 
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };

  return (
    <div className="space-y-8">
      {/* Control Panel */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="form-select text-sm"
              >
                <option value="accuracy">Accuracy</option>
                <option value="precision">Precision</option>
                <option value="recall">Recall</option>
                <option value="f1_score">F1 Score</option>
                <option value="response_time">Response Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-select text-sm"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            📊 Interactive charts - Click legends to toggle data series
          </div>
        </div>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Comparison Bar Chart */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Model Performance Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.performanceComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="model" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy %" />
                <Bar dataKey="precision" fill="#82ca9d" name="Precision %" />
                <Bar dataKey="recall" fill="#ffc658" name="Recall %" />
                <Bar dataKey="f1_score" fill="#ff7300" name="F1 Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Analysis */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Response Time Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.responseTimeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="model" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis yAxisId="time" orientation="left" />
                <YAxis yAxisId="rate" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="time" dataKey="avg_response_time" fill="#8884d8" name="Avg Response Time (s)" />
                <Line yAxisId="rate" type="monotone" dataKey="success_rate" stroke="#ff7300" name="Success Rate %" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Time Series Performance Trends */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Trends Over Time
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {chartData.modelNames.map((model, index) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={model}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart for Multi-dimensional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Multi-Dimensional Performance Radar
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={chartData.radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="metric" fontSize={12} />
                <PolarRadiusAxis 
                  angle={0} 
                  domain={[0, 100]} 
                  fontSize={10}
                  tickCount={5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {chartData.topModels.map((model, index) => (
                  <Radar
                    key={model}
                    name={model}
                    dataKey={model}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData.scoreDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confusion Matrix Heatmap Simulation */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Classification Performance Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartData.confusionMatrixData.map((model, modelIndex) => (
              <div key={model.model} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 text-center">{model.model}</h4>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className="text-center font-medium">Predicted</div>
                  <div className="text-center text-gray-600">Positive</div>
                  <div className="text-center text-gray-600">Negative</div>
                  
                  <div className="text-gray-600 text-right pr-2">Actual Positive</div>
                  <div className={`text-center p-2 rounded ${model.matrix.tp > 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {model.matrix.tp}
                  </div>
                  <div className={`text-center p-2 rounded ${model.matrix.fn < 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {model.matrix.fn}
                  </div>
                  
                  <div className="text-gray-600 text-right pr-2">Actual Negative</div>
                  <div className={`text-center p-2 rounded ${model.matrix.fp < 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {model.matrix.fp}
                  </div>
                  <div className={`text-center p-2 rounded ${model.matrix.tn > 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {model.matrix.tn}
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600 text-center">
                  Accuracy: {((model.matrix.tp + model.matrix.tn) / 
                    (model.matrix.tp + model.matrix.tn + model.matrix.fp + model.matrix.fn) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROC Curve Simulation */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ROC Curve Analysis
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData.rocCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="fpr" 
                label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="random"
                stroke="#cccccc"
                strokeDasharray="5 5"
                name="Random Classifier"
                dot={false}
              />
              {chartData.topModels.map((model, index) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model.replace(/\s+/g, '_')}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  name={`${model} (AUC: ${chartData.aucScores[model]?.toFixed(3) || 'N/A'})`}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost vs Performance Analysis */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost vs Performance Analysis
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartData.costPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="cost_per_1k" 
                name="Cost per 1K tokens ($)"
                label={{ value: 'Cost per 1K tokens ($)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                dataKey="performance_score" 
                name="Performance Score"
                label={{ value: 'Performance Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                        <p className="font-medium text-gray-900">{data.model}</p>
                        <p className="text-sm text-blue-600">Performance: {data.performance_score.toFixed(1)}</p>
                        <p className="text-sm text-green-600">Cost: ${data.cost_per_1k.toFixed(3)}/1K tokens</p>
                        <p className="text-sm text-purple-600">Efficiency: {data.efficiency_ratio.toFixed(2)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Models" fill="#8884d8">
                {chartData.costPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            💡 <strong>Tip:</strong> Models in the top-left quadrant offer the best value (high performance, low cost)
          </div>
        </div>
      </div>

      {/* Model Comparison Table with Detailed Metrics */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Performance Metrics
          </h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Model</th>
                  <th className="table-header-cell">Accuracy</th>
                  <th className="table-header-cell">Precision</th>
                  <th className="table-header-cell">Recall</th>
                  <th className="table-header-cell">F1 Score</th>
                  <th className="table-header-cell">AUC</th>
                  <th className="table-header-cell">Response Time</th>
                  <th className="table-header-cell">Cost/1K</th>
                  <th className="table-header-cell">Throughput</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {chartData.detailedMetrics.map((model, index) => (
                  <tr key={model.model}>
                    <td className="table-cell font-medium">{model.model}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        model.accuracy >= 90 ? 'badge-success' :
                        model.accuracy >= 80 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {model.accuracy.toFixed(1)}%
                      </span>
                    </td>
                    <td className="table-cell">{model.precision.toFixed(2)}</td>
                    <td className="table-cell">{model.recall.toFixed(2)}</td>
                    <td className="table-cell">{model.f1_score.toFixed(2)}</td>
                    <td className="table-cell">{model.auc.toFixed(3)}</td>
                    <td className="table-cell">{model.response_time.toFixed(2)}s</td>
                    <td className="table-cell">${model.cost_per_1k.toFixed(3)}</td>
                    <td className="table-cell">{model.throughput} req/s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          📈 Charts are interactive - hover for details, click legends to toggle data
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary text-sm">
            📊 Export Charts
          </button>
          <button className="btn-primary text-sm">
            📋 Generate Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCharts;