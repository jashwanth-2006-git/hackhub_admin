'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    upcoming: 0,
    ongoing: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [upcomingRes, ongoingRes] = await Promise.all([
        supabase.from('hackathons').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
        supabase.from('hackathons').select('id', { count: 'exact', head: true }).eq('status', 'ongoing'),
      ])

      setStats({
        upcoming: upcomingRes.count || 0,
        ongoing: ongoingRes.count || 0,
        total: (upcomingRes.count || 0) + (ongoingRes.count || 0),
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <p style={styles.subtitle}>Manage your hackathons from here</p>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statValue}>{stats.total}</h3>
          <p style={styles.statLabel}>Total Hackathons</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statValue}>{stats.upcoming}</h3>
          <p style={styles.statLabel}>Upcoming</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statValue}>{stats.ongoing}</h3>
          <p style={styles.statLabel}>Ongoing</p>
        </div>
      </div>

      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <a href="/admin/upcoming" style={styles.actionCard}>
            <h3 style={styles.actionTitle}>Manage Upcoming</h3>
            <p style={styles.actionDesc}>Add, edit, or delete upcoming hackathons</p>
          </a>
          <a href="/admin/ongoing" style={styles.actionCard}>
            <h3 style={styles.actionTitle}>Manage Ongoing</h3>
            <p style={styles.actionDesc}>Add, edit, or delete ongoing hackathons</p>
          </a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#cccccc',
    marginBottom: '40px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#e10600',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#cccccc',
  },
  quickActions: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '24px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '8px',
    padding: '24px',
    transition: 'all 0.3s ease',
    display: 'block',
  },
  actionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px',
  },
  actionDesc: {
    fontSize: '14px',
    color: '#cccccc',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  loadingText: {
    color: '#cccccc',
    fontSize: '18px',
  },
}

