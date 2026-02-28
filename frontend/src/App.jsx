import { Navigate, Route, Routes } from 'react-router'
import './App.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import DashboardPage from './pages/DashboardPage'
import useAuthStore from './zustand/authStore'
import UpdateProfilePage from './pages/UpdateProfilePage'
import AiPage from './pages/AiPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

function App() {
  let authUser = useAuthStore(state => state.user);
  const isCheckingAuth = useAuthStore(state => state.isCheckingAuth);

  if (isCheckingAuth) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-800' />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path='/'
          element={authUser ? <Navigate to='/dashboard' replace /> : <LandingPage />}
        />
        <Route
          path='/login'
          element={authUser ? <Navigate to='/dashboard' replace /> : <LoginPage />}
        />
        <Route
          path='/register'
          element={authUser ? <Navigate to='/dashboard' replace /> : <RegisterPage />}
        />
        <Route
          path='/dashboard'
          element={
            authUser
              ? authUser.role === 'admin'
                ? <Navigate to='/dashboard/admin' replace />
                : <DashboardPage />
              : <Navigate to='/login' replace />
          }
        />
        <Route
          path='/dashboard/admin'
          element={
            authUser
              ? authUser.role === 'admin'
                ? <AdminDashboardPage />
                : <Navigate to='/dashboard' replace />
              : <Navigate to='/login' replace />
          }
        />
        <Route
          path='/dashboard/ai'
          element={authUser ? <AiPage /> : <Navigate to='/login' replace />}
        />
        <Route
          path='/dashboard/updateprofile'
          element={authUser ? <UpdateProfilePage /> : <Navigate to='/login' replace />}
        />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>

    </>
  )
}

export default App
