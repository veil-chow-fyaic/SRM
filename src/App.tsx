import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { SupplierDetail } from './pages/SupplierDetail'
import { SupplierList } from './pages/SupplierList'
import { Dashboard } from './pages/Dashboard'
import { PerformanceAppraisal } from './pages/PerformanceAppraisal'
import { LifecycleManagement } from './pages/LifecycleManagement'
import { TieringStrategy } from './pages/TieringStrategy'
import { PlaceholderPage } from './pages/Placeholder'
import { SystemSettings } from './pages/SystemSettings'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 公共路由 - 登录/注册页 */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* 受保护路由 - 使用 Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Level 1: Cockpit */}
            <Route index element={<Dashboard />} />

            {/* Level 2: Resource Hub */}
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="suppliers/:id" element={<SupplierDetail />} />
            <Route path="supplier-profile" element={<SupplierList />} />
            <Route path="supplier-profile/:id" element={<SupplierDetail />} />
            <Route path="resources/assets" element={<PlaceholderPage />} />
            <Route path="resources/leads" element={<PlaceholderPage />} />

            {/* Level 3: Relations (Moved to SupplierDetail) */}
            {/* <Route path="relations/logs" element={<EngagementLogs />} /> */}
            {/* <Route path="relations/contracts" element={<PlaceholderPage />} /> */}
            {/* <Route path="relations/ops-dna" element={<PlaceholderPage />} /> */}

            {/* Level 4: Performance */}
            <Route path="performance/lifecycle" element={<LifecycleManagement />} />
            <Route path="performance/appraisal" element={<PerformanceAppraisal />} />
            <Route path="performance/tiering" element={<TieringStrategy />} />

            {/* Level 5: Win-Win Portal */}
            <Route path="portal/broadcast" element={<PlaceholderPage />} />
            <Route path="portal/empowerment" element={<PlaceholderPage />} />
            <Route path="portal/tickets" element={<PlaceholderPage />} />

            {/* Level 6: Settings */}
            <Route path="settings" element={<SystemSettings />} />

            {/* Level 7: Support */}
            <Route path="support/odc-audit" element={<PlaceholderPage title="ODC 审计 (ODC Audit)" />} />
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">页面未找到</p>
                  <a href="#/" className="text-brand hover:underline">
                    返回首页
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
