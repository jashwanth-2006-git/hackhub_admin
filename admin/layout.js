'use client'

import ProtectedRoute from '../../components/ProtectedRoute'
import AdminSidebar from '../../components/AdminSidebar'
import { useEffect, useState } from 'react'

export default function AdminLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Ensure admin pages have full viewport height
  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    return () => {
      document.body.style.margin = ''
      document.body.style.padding = ''
    }
  }, [])

  return (
    <ProtectedRoute>
      <div style={styles.adminWrapper}>
        <AdminSidebar />
        <main style={{
          ...styles.main,
          marginLeft: isMobile ? '0' : '250px',
          padding: isMobile ? '20px' : '40px',
        }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

const styles = {
  adminWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#0f0f0f',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
  },
  main: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    transition: 'margin-left 0.3s ease, padding 0.3s ease',
    width: '100%',
    overflowY: 'auto',
  },
}

