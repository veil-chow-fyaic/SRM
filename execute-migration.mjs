import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  'https://tdrbuwshyebmjqljggww.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcmJ1d3NoeWVibWpxbGpnZ3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1OTY1NTYsImV4cCI6MjA4NjE3MjU1Nn0.sCLu2Zc4BmtAMvf_BeeZLRa6NfN_2KAMQO4HrZD9Bqg'
)

async function executeMigration() {
  console.log('='.repeat(60))
  console.log('执行迁移: enhance_supplier_detail_rpc')
  console.log('='.repeat(60))
  console.log()

  // 读取 SQL 文件
  const sqlPath = resolve('database/migrations/20260210000001_enhance_supplier_detail_rpc.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  console.log('SQL 文件已读取')
  console.log('文件大小:', sql.length, '字符')
  console.log()
  console.log('⚠️  注意: Supabase JS 客户端不支持直接执行 DDL 语句')
  console.log('请使用以下方式之一执行迁移:')
  console.log()
  console.log('方式 1: Supabase Dashboard (推荐)')
  console.log('  1. 打开 https://supabase.com/dashboard')
  console.log('  2. 选择项目 tdrbuwshyebmjqljggww')
  console.log('  3. 进入 SQL Editor')
  console.log('  4. 复制粘贴 SQL 文件内容')
  console.log('  5. 点击 Run')
  console.log()
  console.log('方式 2: Supabase CLI')
  console.log('  npx supabase db push')
  console.log()
  console.log('SQL 文件路径:', sqlPath)
  console.log()
  console.log('执行完成后，运行 node test-rpc-function.mjs 验证')
}

executeMigration().catch(console.error)
