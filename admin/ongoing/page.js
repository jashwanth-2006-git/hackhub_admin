'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminOngoingPage() {
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    start_date: '',
    end_date: '',
    time: '',
    mode: '',
    registration_link: '',
    status: 'ongoing',
  })

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .eq('status', 'ongoing')
        .order('start_date', { ascending: true })

      if (error) throw error
      setHackathons(data || [])
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      alert('Failed to load hackathons')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return null

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `hackathons/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('hackathon-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('hackathon-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image: ' + error.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let imageUrl = formData.image_url

      // Upload image if a new file is selected
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          return // Stop if upload failed
        }
      }

      const submitData = {
        ...formData,
        image_url: imageUrl,
      }

      if (editingId) {
        const { error } = await supabase
          .from('hackathons')
          .update(submitData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('hackathons')
          .insert([submitData])

        if (error) throw error
      }

      resetForm()
      fetchHackathons()
    } catch (error) {
      console.error('Error saving hackathon:', error)
      alert('Failed to save hackathon: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return

    try {
      const { error } = await supabase
        .from('hackathons')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchHackathons()
    } catch (error) {
      console.error('Error deleting hackathon:', error)
      alert('Failed to delete hackathon')
    }
  }

  const handleEdit = (hackathon) => {
    setFormData({
      name: hackathon.name || '',
      description: hackathon.description || '',
      image_url: hackathon.image_url || '',
      start_date: hackathon.start_date || '',
      end_date: hackathon.end_date || '',
      time: hackathon.time || '',
      mode: hackathon.mode || '',
      registration_link: hackathon.registration_link || '',
      status: hackathon.status || 'ongoing',
    })
    setImageFile(null)
    setImagePreview(hackathon.image_url || '')
    setEditingId(hackathon.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      start_date: '',
      end_date: '',
      time: '',
      mode: '',
      registration_link: '',
      status: 'ongoing',
    })
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Ongoing Hackathons</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
          style={styles.addBtn}
        >
          {showForm ? 'Cancel' : '+ Add Hackathon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>
            {editingId ? 'Edit Hackathon' : 'Add New Hackathon'}
          </h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroupFull}>
              <label style={styles.label}>Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.fileInput}
              />
              {imagePreview && (
                <div style={styles.imagePreview}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                      setFormData({ ...formData, image_url: '' })
                    }}
                    style={styles.removeImageBtn}
                  >
                    Remove Image
                  </button>
                </div>
              )}
              {uploading && (
                <p style={styles.uploadingText}>Uploading image...</p>
              )}
            </div>
            <div style={styles.formGroupFull}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                style={styles.textarea}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>End Date *</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Time</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g., 9:00 AM - 6:00 PM"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                style={styles.input}
              >
                <option value="">Select Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div style={styles.formGroupFull}>
              <label style={styles.label}>Registration Link</label>
              <input
                type="url"
                value={formData.registration_link}
                onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn-primary" style={styles.submitBtn}>
              {editingId ? 'Update' : 'Add'} Hackathon
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary" style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={styles.list}>
        {hackathons.length === 0 ? (
          <p style={styles.empty}>No ongoing hackathons. Add one to get started!</p>
        ) : (
          hackathons.map((hackathon) => (
            <div key={hackathon.id} style={styles.card}>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{hackathon.name}</h3>
                <p style={styles.cardDesc}>{hackathon.description || 'No description'}</p>
                <div style={styles.cardDetails}>
                  <span>Date: {hackathon.start_date} - {hackathon.end_date}</span>
                  {hackathon.mode && <span>Mode: {hackathon.mode}</span>}
                </div>
              </div>
              <div style={styles.cardActions}>
                <button
                  onClick={() => handleEdit(hackathon)}
                  style={styles.editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hackathon.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addBtn: {
    backgroundColor: '#e10600',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '8px',
    padding: '32px',
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formGroupFull: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: '#cccccc',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0f0f0f',
    border: '1px solid #333333',
    borderRadius: '4px',
    padding: '12px',
    color: '#ffffff',
    fontSize: '16px',
  },
  textarea: {
    backgroundColor: '#0f0f0f',
    border: '1px solid #333333',
    borderRadius: '4px',
    padding: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  submitBtn: {
    backgroundColor: '#e10600',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    padding: '12px 24px',
    border: '2px solid #e10600',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px',
  },
  cardDesc: {
    color: '#cccccc',
    fontSize: '14px',
    marginBottom: '12px',
  },
  cardDetails: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#888888',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
  },
  editBtn: {
    backgroundColor: '#e10600',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    color: '#e10600',
    padding: '8px 16px',
    border: '1px solid #e10600',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#cccccc',
    fontSize: '18px',
    padding: '40px',
  },
  loading: {
    textAlign: 'center',
    color: '#cccccc',
    fontSize: '18px',
    padding: '40px',
  },
  fileInput: {
    backgroundColor: '#0f0f0f',
    border: '1px solid #333333',
    borderRadius: '4px',
    padding: '12px',
    color: '#ffffff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  imagePreview: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '4px',
    border: '1px solid #333333',
  },
  removeImageBtn: {
    backgroundColor: 'transparent',
    color: '#e10600',
    border: '1px solid #e10600',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: 'fit-content',
  },
  uploadingText: {
    color: '#cccccc',
    fontSize: '14px',
    marginTop: '8px',
    fontStyle: 'italic',
  },
}

