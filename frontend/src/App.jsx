import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import SupplyChainMap from './pages/SupplyChainMap'
import SupplierGraph from './pages/SupplierGraph'
import RiskScoring from './pages/RiskScoring'
import DisruptionPrediction from './pages/DisruptionPrediction'
import SinglePointFailure from './pages/SinglePointFailure'
import AlternativeSuppliers from './pages/AlternativeSuppliers'
import IndustryMonitor from './pages/IndustryMonitor'
import Alerts from './pages/Alerts'
import Simulation from './pages/Simulation'
import RiskHeatmap from './pages/RiskHeatmap'
import Copilot from './pages/Copilot'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <Header />
      <main className="ml-56 pt-14 min-h-screen">
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes — redirect to /signin if not logged in */}
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><Layout><SupplyChainMap /></Layout></ProtectedRoute>} />
          <Route path="/graph" element={<ProtectedRoute><Layout><SupplierGraph /></Layout></ProtectedRoute>} />
          <Route path="/risk-scoring" element={<ProtectedRoute><Layout><RiskScoring /></Layout></ProtectedRoute>} />
          <Route path="/prediction" element={<ProtectedRoute><Layout><DisruptionPrediction /></Layout></ProtectedRoute>} />
          <Route path="/spof" element={<ProtectedRoute><Layout><SinglePointFailure /></Layout></ProtectedRoute>} />
          <Route path="/alternatives" element={<ProtectedRoute><Layout><AlternativeSuppliers /></Layout></ProtectedRoute>} />
          <Route path="/industries" element={<ProtectedRoute><Layout><IndustryMonitor /></Layout></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Layout><Alerts /></Layout></ProtectedRoute>} />
          <Route path="/simulation" element={<ProtectedRoute><Layout><Simulation /></Layout></ProtectedRoute>} />
          <Route path="/heatmap" element={<ProtectedRoute><Layout><RiskHeatmap /></Layout></ProtectedRoute>} />
          <Route path="/copilot" element={<ProtectedRoute><Layout><Copilot /></Layout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
