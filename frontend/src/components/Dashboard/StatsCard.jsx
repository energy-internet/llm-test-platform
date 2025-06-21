// src/components/Dashboard/StatsCard.jsx
import React from 'react'
import { Card, Statistic } from 'antd'

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={
          <div style={{ color, fontSize: 24 }}>
            {icon}
          </div>
        }
        valueStyle={{ 
          color,
          fontSize: 32,
          fontWeight: 'bold'
        }}
      />
    </Card>
  )
}

export default StatsCard