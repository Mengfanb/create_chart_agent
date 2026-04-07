-- 创建表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);

-- 数据库连接表 (database_connections)
CREATE TABLE database_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('postgresql', 'mysql', 'sqlite')),
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    database VARCHAR(100) NOT NULL,
    connection_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_db_connections_user_id ON database_connections(user_id);
CREATE INDEX idx_db_connections_active ON database_connections(is_active);

-- 查询历史表 (query_history)
CREATE TABLE query_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    database_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
    natural_query TEXT NOT NULL,
    generated_sql TEXT NOT NULL,
    ai_explanation JSONB,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_query_history_user_id ON query_history(user_id);
CREATE INDEX idx_query_history_database_id ON query_history(database_id);
CREATE INDEX idx_query_history_executed_at ON query_history(executed_at DESC);

-- 查询结果表 (query_results)
CREATE TABLE query_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES query_history(id) ON DELETE CASCADE,
    columns JSONB NOT NULL,
    data JSONB NOT NULL,
    chart_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_query_results_query_id ON query_results(query_id);

-- 基本读取权限
GRANT SELECT ON users TO anon;
GRANT SELECT ON database_connections TO anon;
GRANT SELECT ON query_history TO anon;
GRANT SELECT ON query_results TO anon;

-- 完整权限
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON database_connections TO authenticated;
GRANT ALL PRIVILEGES ON query_history TO authenticated;
GRANT ALL PRIVILEGES ON query_results TO authenticated;
