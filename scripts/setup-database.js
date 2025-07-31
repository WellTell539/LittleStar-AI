#!/usr/bin/env node
/**
 * 数据库自动配置脚本
 * 支持 PostgreSQL, MySQL, SQLite
 * 自动创建数据库、表结构并更新环境变量
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 数据库配置选项
const DB_CONFIGS = {
  postgresql: {
    docker: true,
    image: 'postgres:15',
    port: 5432,
    defaultDB: 'postgres',
    createDB: 'claude_ai_dashboard',
    user: 'claude_user',
    password: 'claude_pass_2024',
    connectionString: (config) => 
      `postgresql://${config.user}:${config.password}@localhost:${config.port}/${config.createDB}`
  },
  mysql: {
    docker: true,
    image: 'mysql:8.0',
    port: 3306,
    defaultDB: 'mysql',
    createDB: 'claude_ai_dashboard',
    user: 'claude_user',
    password: 'claude_pass_2024',
    connectionString: (config) => 
      `mysql://${config.user}:${config.password}@localhost:${config.port}/${config.createDB}`
  },
  sqlite: {
    docker: false,
    file: './database/claude_ai.db',
    connectionString: () => 'file:./database/claude_ai.db'
  }
};

// 数据库表结构 SQL
const TABLE_SCHEMAS = {
  postgresql: `
    -- AI 核心数据表
    CREATE TABLE IF NOT EXISTS ai_personalities (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      openness INTEGER DEFAULT 50,
      conscientiousness INTEGER DEFAULT 50,
      extraversion INTEGER DEFAULT 50,
      agreeableness INTEGER DEFAULT 50,
      neuroticism INTEGER DEFAULT 50,
      curiosity INTEGER DEFAULT 50,
      creativity INTEGER DEFAULT 50,
      empathy INTEGER DEFAULT 50,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_emotions (
      id SERIAL PRIMARY KEY,
      primary_emotion VARCHAR(50) NOT NULL,
      intensity INTEGER DEFAULT 50,
      triggers TEXT[],
      duration INTEGER DEFAULT 0,
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_memories (
      id SERIAL PRIMARY KEY,
      memory_id VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      emotional_weight INTEGER DEFAULT 0,
      importance INTEGER DEFAULT 50,
      tags TEXT[],
      mood VARCHAR(50),
      personal_reflection TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id SERIAL PRIMARY KEY,
      knowledge_id VARCHAR(255) UNIQUE NOT NULL,
      topic VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      source VARCHAR(255),
      mastery_level INTEGER DEFAULT 0,
      importance INTEGER DEFAULT 1,
      tags TEXT[],
      learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_social_posts (
      id SERIAL PRIMARY KEY,
      post_id VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      mood VARCHAR(50),
      tags TEXT[],
      visibility VARCHAR(20) DEFAULT 'public',
      authenticity INTEGER DEFAULT 85,
      spontaneous BOOLEAN DEFAULT true,
      twitter_synced BOOLEAN DEFAULT false,
      twitter_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_goals (
      id SERIAL PRIMARY KEY,
      goal_id VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL,
      priority INTEGER DEFAULT 5,
      progress INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'planned',
      deadline TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    );

    -- 索引优化
    CREATE INDEX IF NOT EXISTS idx_memories_type ON ai_memories(type);
    CREATE INDEX IF NOT EXISTS idx_memories_created_at ON ai_memories(created_at);
    CREATE INDEX IF NOT EXISTS idx_knowledge_category ON ai_knowledge(category);
    CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON ai_social_posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_goals_status ON ai_goals(status);
  `,
  
  mysql: `
    -- AI 核心数据表 (MySQL版本)
    CREATE TABLE IF NOT EXISTS ai_personalities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      openness INT DEFAULT 50,
      conscientiousness INT DEFAULT 50,
      extraversion INT DEFAULT 50,
      agreeableness INT DEFAULT 50,
      neuroticism INT DEFAULT 50,
      curiosity INT DEFAULT 50,
      creativity INT DEFAULT 50,
      empathy INT DEFAULT 50,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_emotions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      primary_emotion VARCHAR(50) NOT NULL,
      intensity INT DEFAULT 50,
      triggers JSON,
      duration INT DEFAULT 0,
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_memories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      memory_id VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      emotional_weight INT DEFAULT 0,
      importance INT DEFAULT 50,
      tags JSON,
      mood VARCHAR(50),
      personal_reflection TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id INT AUTO_INCREMENT PRIMARY KEY,
      knowledge_id VARCHAR(255) UNIQUE NOT NULL,
      topic VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      source VARCHAR(255),
      mastery_level INT DEFAULT 0,
      importance INT DEFAULT 1,
      tags JSON,
      learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_social_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      mood VARCHAR(50),
      tags JSON,
      visibility VARCHAR(20) DEFAULT 'public',
      authenticity INT DEFAULT 85,
      spontaneous BOOLEAN DEFAULT true,
      twitter_synced BOOLEAN DEFAULT false,
      twitter_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_goals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      goal_id VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL,
      priority INT DEFAULT 5,
      progress INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'planned',
      deadline TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL
    );
  `,

  sqlite: `
    -- AI 核心数据表 (SQLite版本)
    CREATE TABLE IF NOT EXISTS ai_personalities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      openness INTEGER DEFAULT 50,
      conscientiousness INTEGER DEFAULT 50,
      extraversion INTEGER DEFAULT 50,
      agreeableness INTEGER DEFAULT 50,
      neuroticism INTEGER DEFAULT 50,
      curiosity INTEGER DEFAULT 50,
      creativity INTEGER DEFAULT 50,
      empathy INTEGER DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_emotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      primary_emotion TEXT NOT NULL,
      intensity INTEGER DEFAULT 50,
      triggers TEXT,
      duration INTEGER DEFAULT 0,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memory_id TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      emotional_weight INTEGER DEFAULT 0,
      importance INTEGER DEFAULT 50,
      tags TEXT,
      mood TEXT,
      personal_reflection TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      knowledge_id TEXT UNIQUE NOT NULL,
      topic TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      mastery_level INTEGER DEFAULT 0,
      importance INTEGER DEFAULT 1,
      tags TEXT,
      learned_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_social_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      mood TEXT,
      tags TEXT,
      visibility TEXT DEFAULT 'public',
      authenticity INTEGER DEFAULT 85,
      spontaneous BOOLEAN DEFAULT true,
      twitter_synced BOOLEAN DEFAULT false,
      twitter_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      priority INTEGER DEFAULT 5,
      progress INTEGER DEFAULT 0,
      status TEXT DEFAULT 'planned',
      deadline DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );
  `
};

class DatabaseSetup {
  constructor() {
    this.envFile = path.join(__dirname, '../.env.local');
    this.selectedDB = null;
    this.config = null;
  }

  // 显示数据库选择菜单
  showDatabaseMenu() {
    console.log('\n🗄️  数据库自动配置脚本');
    console.log('=====================================');
    console.log('请选择数据库类型:');
    console.log('1. PostgreSQL (推荐生产环境)');
    console.log('2. MySQL (兼容性好)');
    console.log('3. SQLite (开发测试)');
    console.log('=====================================\n');
  }

  // 检查 Docker 是否可用
  checkDockerAvailable() {
    try {
      execSync('docker --version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  // 启动 Docker 数据库容器
  async startDockerDatabase(dbType) {
    const config = DB_CONFIGS[dbType];
    const containerName = `claude-ai-${dbType}`;

    console.log(`🐳 启动 ${dbType.toUpperCase()} Docker 容器...`);

    try {
      // 停止并删除已存在的容器
      try {
        execSync(`docker stop ${containerName}`, { stdio: 'pipe' });
        execSync(`docker rm ${containerName}`, { stdio: 'pipe' });
      } catch (e) {
        // 容器不存在，忽略错误
      }

      // 启动新容器
      if (dbType === 'postgresql') {
        execSync(`docker run -d \
          --name ${containerName} \
          -e POSTGRES_USER=${config.user} \
          -e POSTGRES_PASSWORD=${config.password} \
          -e POSTGRES_DB=${config.createDB} \
          -p ${config.port}:5432 \
          ${config.image}`, { stdio: 'inherit' });
      } else if (dbType === 'mysql') {
        execSync(`docker run -d \
          --name ${containerName} \
          -e MYSQL_ROOT_PASSWORD=${config.password} \
          -e MYSQL_DATABASE=${config.createDB} \
          -e MYSQL_USER=${config.user} \
          -e MYSQL_PASSWORD=${config.password} \
          -p ${config.port}:3306 \
          ${config.image}`, { stdio: 'inherit' });
      }

      console.log(`✅ ${dbType.toUpperCase()} 容器启动成功！`);
      
      // 等待数据库启动
      console.log('⏳ 等待数据库完全启动...');
      await this.waitForDatabase(dbType, config);
      
      return true;
    } catch (error) {
      console.error(`❌ 启动 ${dbType} 容器失败:`, error.message);
      return false;
    }
  }

  // 等待数据库就绪
  async waitForDatabase(dbType, config) {
    const maxRetries = 30;
    const retryInterval = 2000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        if (dbType === 'postgresql') {
          execSync(`docker exec claude-ai-${dbType} pg_isready -U ${config.user}`, { stdio: 'pipe' });
        } else if (dbType === 'mysql') {
          execSync(`docker exec claude-ai-${dbType} mysqladmin ping -h localhost -u ${config.user} -p${config.password}`, { stdio: 'pipe' });
        }
        console.log('✅ 数据库已就绪！');
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw new Error('数据库启动超时');
        }
        console.log(`⏳ 等待数据库启动... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
  }

  // 创建数据库表结构
  async createTables(dbType) {
    console.log('📋 创建数据库表结构...');

    try {
      const schema = TABLE_SCHEMAS[dbType];
      
      if (dbType === 'postgresql') {
        // 创建临时 SQL 文件
        const sqlFile = path.join(__dirname, 'temp_schema.sql');
        fs.writeFileSync(sqlFile, schema);
        
        execSync(`docker exec -i claude-ai-${dbType} psql -U ${this.config.user} -d ${this.config.createDB} < ${sqlFile}`, { stdio: 'inherit' });
        
        // 删除临时文件
        fs.unlinkSync(sqlFile);
      } else if (dbType === 'mysql') {
        const sqlFile = path.join(__dirname, 'temp_schema.sql');
        fs.writeFileSync(sqlFile, schema);
        
        execSync(`docker exec -i claude-ai-${dbType} mysql -u ${this.config.user} -p${this.config.password} ${this.config.createDB} < ${sqlFile}`, { stdio: 'inherit' });
        
        fs.unlinkSync(sqlFile);
      } else if (dbType === 'sqlite') {
        // 确保数据库目录存在
        const dbDir = path.dirname(this.config.file);
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
        
        // 使用 sqlite3 创建表
        const sqlFile = path.join(__dirname, 'temp_schema.sql');
        fs.writeFileSync(sqlFile, schema);
        
        execSync(`sqlite3 ${this.config.file} < ${sqlFile}`, { stdio: 'inherit' });
        
        fs.unlinkSync(sqlFile);
      }

      console.log('✅ 数据库表结构创建成功！');
      return true;
    } catch (error) {
      console.error('❌ 创建数据库表失败:', error.message);
      return false;
    }
  }

  // 更新环境变量
  updateEnvFile(connectionString) {
    console.log('📝 更新环境变量文件...');

    try {
      let envContent = '';
      
      if (fs.existsSync(this.envFile)) {
        envContent = fs.readFileSync(this.envFile, 'utf8');
      } else {
        // 如果不存在 .env.local，从 env.example 复制
        const envExample = path.join(__dirname, '../env.example');
        if (fs.existsSync(envExample)) {
          envContent = fs.readFileSync(envExample, 'utf8');
        }
      }

      // 更新或添加 DATABASE_URL
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${connectionString}`);
      } else {
        envContent += `\n# 数据库配置 (自动生成)\nDATABASE_URL=${connectionString}\n`;
      }

      fs.writeFileSync(this.envFile, envContent);
      console.log('✅ 环境变量更新成功！');
      console.log(`📍 数据库连接字符串: ${connectionString}`);
      
      return true;
    } catch (error) {
      console.error('❌ 更新环境变量失败:', error.message);
      return false;
    }
  }

  // 生成数据库管理脚本
  generateManagementScripts() {
    const scriptsDir = path.join(__dirname, '../database-scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // 备份脚本
    const backupScript = `#!/bin/bash
# 数据库备份脚本

echo "🗄️  开始数据库备份..."

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="claude_ai_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

if [ "${this.selectedDB}" = "postgresql" ]; then
    docker exec claude-ai-postgresql pg_dump -U ${this.config.user} ${this.config.createDB} > "$BACKUP_DIR/$BACKUP_FILE"
elif [ "${this.selectedDB}" = "mysql" ]; then
    docker exec claude-ai-mysql mysqldump -u ${this.config.user} -p${this.config.password} ${this.config.createDB} > "$BACKUP_DIR/$BACKUP_FILE"
elif [ "${this.selectedDB}" = "sqlite" ]; then
    cp ${this.config.file} "$BACKUP_DIR/claude_ai_backup_$TIMESTAMP.db"
fi

echo "✅ 备份完成: $BACKUP_DIR/$BACKUP_FILE"
`;

    // 还原脚本
    const restoreScript = `#!/bin/bash
# 数据库还原脚本

if [ $# -eq 0 ]; then
    echo "使用方法: ./restore.sh <备份文件>"
    exit 1
fi

BACKUP_FILE="$1"

echo "🔄 开始还原数据库..."

if [ "${this.selectedDB}" = "postgresql" ]; then
    docker exec -i claude-ai-postgresql psql -U ${this.config.user} -d ${this.config.createDB} < "$BACKUP_FILE"
elif [ "${this.selectedDB}" = "mysql" ]; then
    docker exec -i claude-ai-mysql mysql -u ${this.config.user} -p${this.config.password} ${this.config.createDB} < "$BACKUP_FILE"
elif [ "${this.selectedDB}" = "sqlite" ]; then
    cp "$BACKUP_FILE" ${this.config.file}
fi

echo "✅ 数据库还原完成！"
`;

    // 清理脚本
    const cleanupScript = `#!/bin/bash
# 数据库清理脚本

echo "⚠️  警告: 此操作将删除所有数据库数据！"
read -p "确认继续? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ "${this.selectedDB}" = "postgresql" ]; then
        docker exec claude-ai-postgresql psql -U ${this.config.user} -d ${this.config.createDB} -c "
        TRUNCATE TABLE ai_personalities, ai_emotions, ai_memories, ai_knowledge, ai_social_posts, ai_goals RESTART IDENTITY CASCADE;
        "
    elif [ "${this.selectedDB}" = "mysql" ]; then
        docker exec claude-ai-mysql mysql -u ${this.config.user} -p${this.config.password} ${this.config.createDB} -e "
        TRUNCATE TABLE ai_personalities;
        TRUNCATE TABLE ai_emotions;
        TRUNCATE TABLE ai_memories;
        TRUNCATE TABLE ai_knowledge;
        TRUNCATE TABLE ai_social_posts;
        TRUNCATE TABLE ai_goals;
        "
    elif [ "${this.selectedDB}" = "sqlite" ]; then
        rm -f ${this.config.file}
        sqlite3 ${this.config.file} < ../scripts/temp_schema.sql
    fi
    echo "✅ 数据库清理完成！"
else
    echo "❌ 操作已取消"
fi
`;

    fs.writeFileSync(path.join(scriptsDir, 'backup.sh'), backupScript);
    fs.writeFileSync(path.join(scriptsDir, 'restore.sh'), restoreScript);
    fs.writeFileSync(path.join(scriptsDir, 'cleanup.sh'), cleanupScript);

    // 添加执行权限 (Unix系统)
    try {
      execSync(`chmod +x ${scriptsDir}/*.sh`);
    } catch (e) {
      // Windows 系统忽略
    }

    console.log('📋 数据库管理脚本已生成:');
    console.log(`   - 备份: ${scriptsDir}/backup.sh`);
    console.log(`   - 还原: ${scriptsDir}/restore.sh`);
    console.log(`   - 清理: ${scriptsDir}/cleanup.sh`);
  }

  // 主要设置流程
  async setup() {
    this.showDatabaseMenu();

    // 简化为自动选择 PostgreSQL
    console.log('🚀 自动选择 PostgreSQL (推荐)...\n');
    
    this.selectedDB = 'postgresql';
    this.config = DB_CONFIGS[this.selectedDB];

    // 检查 Docker
    if (this.config.docker && !this.checkDockerAvailable()) {
      console.error('❌ Docker 未安装或未启动，请先安装 Docker');
      console.log('📖 安装指南: https://docs.docker.com/get-docker/');
      process.exit(1);
    }

    console.log(`📊 配置信息:`);
    console.log(`   数据库类型: ${this.selectedDB.toUpperCase()}`);
    console.log(`   端口: ${this.config.port}`);
    console.log(`   数据库名: ${this.config.createDB}`);
    console.log(`   用户名: ${this.config.user}`);
    console.log(`   密码: ${this.config.password}\n`);

    // 启动数据库
    if (this.config.docker) {
      const success = await this.startDockerDatabase(this.selectedDB);
      if (!success) {
        console.error('❌ 数据库启动失败');
        process.exit(1);
      }
    }

    // 创建表结构
    const tablesCreated = await this.createTables(this.selectedDB);
    if (!tablesCreated) {
      console.error('❌ 数据库表创建失败');
      process.exit(1);
    }

    // 更新环境变量
    const connectionString = this.config.connectionString(this.config);
    const envUpdated = this.updateEnvFile(connectionString);
    if (!envUpdated) {
      console.error('❌ 环境变量更新失败');
      process.exit(1);
    }

    // 生成管理脚本
    this.generateManagementScripts();

    console.log('\n🎉 数据库配置完成！');
    console.log('=====================================');
    console.log('✅ 数据库服务已启动');
    console.log('✅ 表结构已创建');
    console.log('✅ 环境变量已配置');
    console.log('✅ 管理脚本已生成');
    console.log('=====================================');
    console.log('🚀 现在可以启动应用: npm run dev');
    console.log('📊 数据库管理: 查看 database-scripts/ 目录\n');
  }
}

// 运行脚本
if (require.main === module) {
  const dbSetup = new DatabaseSetup();
  dbSetup.setup().catch(error => {
    console.error('❌ 设置失败:', error.message);
    process.exit(1);
  });
}

module.exports = DatabaseSetup; 