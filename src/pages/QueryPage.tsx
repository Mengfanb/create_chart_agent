import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Database, Send, Loader2, Bot, User, Plus } from 'lucide-react'
import AddDatabaseModal from '../components/AddDatabaseModal'

export default function QueryPage() {
  const navigate = useNavigate()
  const { databases, setDatabases, selectedDatabaseId, setSelectedDatabaseId } = useAppStore()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: '你好！我是你的智能数据库助手。请选择一个数据库，然后告诉我你想查询什么数据。' }
  ])

  useEffect(() => {
    // Fetch available databases
    fetch('/api/databases')
      .then(res => res.json())
      .then(data => {
        setDatabases(data)
        if (data.length > 0 && !selectedDatabaseId) {
          setSelectedDatabaseId(data[0].id)
        }
      })
      .catch(err => console.error('Failed to fetch databases', err))
  }, [])

  const handleSend = async () => {
    if (!query.trim() || !selectedDatabaseId) return

    const userMessage = query.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setQuery('')
    setIsLoading(true)

    try {
      // Step 1: Analyze query using LLM
      const analyzeRes = await fetch('/api/query/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId: selectedDatabaseId, query: userMessage, context: messages })
      })
      const analyzeData = await analyzeRes.json()

      if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Failed to analyze query')

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `我已经理解了你的需求。\n\n**分析解释**：${analyzeData.explanation}\n\n**生成的SQL**：\n\`\`\`sql\n${analyzeData.sql}\n\`\`\`\n\n如果确认无误，我将执行查询。` 
      }])

      // Automatically execute for the demo, or wait for user confirmation
      // For simplicity, we auto-execute here and redirect to results
      const executeRes = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId: selectedDatabaseId, sql: analyzeData.sql })
      })
      const executeData = await executeRes.json()
      
      if (!executeRes.ok) throw new Error(executeData.error || 'Failed to execute query')

      useAppStore.getState().setQueryResult({
        sql: analyzeData.sql,
        explanation: analyzeData.explanation,
        ...executeData
      })
      
      navigate('/result/latest')

    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `出错了：${error.message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left Sidebar - Database Selection */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <Database className="w-5 h-5" />
            AI Query
          </h1>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              选择数据库
            </h2>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 rounded transition-colors"
              title="添加数据库"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {databases.map(db => (
              <button
                key={db.id}
                onClick={() => setSelectedDatabaseId(db.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedDatabaseId === db.id 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                }`}
              >
                <div className="font-medium">{db.name}</div>
                <div className="text-xs opacity-70">{db.type}</div>
              </button>
            ))}
            {databases.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4">
                暂无可用数据库
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-200">
          <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="例如：显示去年各月份的销售额趋势..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none resize-none focus:ring-0 p-2 text-sm text-slate-800"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!query.trim() || !selectedDatabaseId || isLoading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 mb-1"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-slate-400">
            按 Enter 发送，Shift + Enter 换行
          </div>
        </div>
      </div>

      <AddDatabaseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newDb) => {
          setDatabases([newDb, ...databases])
          setSelectedDatabaseId(newDb.id)
        }}
      />
    </div>
  )
}
