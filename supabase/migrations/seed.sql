-- 插入测试用户
INSERT INTO users (id, email, name, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'premium')
ON CONFLICT (email) DO NOTHING;

-- 插入测试数据库连接
INSERT INTO database_connections (id, user_id, name, type, host, port, database, connection_config, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000001', 
    '演示销售数据库', 
    'postgresql', 
    'localhost', 
    5432, 
    'demo_sales_db', 
    '{}', 
    true
)
ON CONFLICT DO NOTHING;
