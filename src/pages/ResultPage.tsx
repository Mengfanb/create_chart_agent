import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ArrowLeft, Code, Table as TableIcon, BarChart2 } from 'lucide-react'
import ReactECharts from 'echarts-for-react'

type ViewMode = 'sql' | 'data' | 'chart'

export default function ResultPage() {
  const navigate = useNavigate()
  const { queryResult } = useAppStore()
  const [viewMode, setViewMode] = useState<ViewMode>('chart')

  if (!queryResult) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">没有找到查询结果</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          返回查询页面
        </button>
      </div>
    )
  }

  const { sql, explanation, columns, data, chartConfig } = queryResult

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">分析结果</h1>
        </div>

        {/* View Toggles */}
        <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('sql')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'sql' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" />
            SQL语句
          </button>
          <button
            onClick={() => setViewMode('data')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'data' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            数据表格
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'chart' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            可视化图表
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
          {/* AI Explanation (Always visible at top or side, let's put it at top) */}
          <div className="p-4 border-b border-slate-100 bg-blue-50/50 rounded-t-xl">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">AI 解释</h3>
            <p className="text-sm text-slate-700">{explanation}</p>
          </div>

          <div className="flex-1 p-6">
            {/* SQL View */}
            {viewMode === 'sql' && (
              <div className="h-full">
                <div className="bg-slate-900 rounded-lg p-4 h-full overflow-auto">
                  <pre className="text-sm text-slate-50 font-mono whitespace-pre-wrap">
                    {sql}
                  </pre>
                </div>
              </div>
            )}

            {/* Data View */}
            {viewMode === 'data' && (
              <div className="h-full overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      {columns?.map((col: string, idx: number) => (
                        <th key={idx} className="p-3 border-b-2 border-slate-200 text-sm font-semibold text-slate-600 bg-slate-50 sticky top-0">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                        {columns?.map((col: string, cIdx: number) => (
                          <td key={cIdx} className="p-3 text-sm text-slate-700">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!data || data.length === 0) && (
                  <div className="text-center py-12 text-slate-500">暂无数据</div>
                )}
              </div>
            )}

            {/* Chart View */}
            {viewMode === 'chart' && (
              <div className="h-full min-h-[400px] w-full flex items-center justify-center">
                {chartConfig ? (
                  <ReactECharts 
                    option={chartConfig} 
                    style={{ height: '100%', width: '100%', minHeight: '400px' }} 
                    opts={{ renderer: 'svg' }}
                  />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center">
                    <BarChart2 className="w-12 h-12 text-slate-300 mb-2" />
                    <p>无法为该数据生成图表</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
