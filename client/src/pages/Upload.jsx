import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDeviceId } from '../lib/deviceId'
import ImageCapture from '../components/ImageCapture'
import './Upload.css'

const currentYear = new Date().getFullYear()

function makeEntry(file, dateTaken) {
  const hasDate = dateTaken && !isNaN(dateTaken.getFullYear())
  return {
    id: crypto.randomUUID(),
    file,
    preview: URL.createObjectURL(file),
    year: hasDate ? dateTaken.getFullYear() : currentYear,
    month: hasDate ? dateTaken.getMonth() + 1 : '',
    day: hasDate ? dateTaken.getDate() : '',
    caption: '',
    name: '',
    nameEdited: false,
  }
}

function Upload() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleImagesSelect = useCallback((results) => {
    const newEntries = results.map(({ file, dateTaken }) => makeEntry(file, dateTaken))
    setEntries((prev) => [...prev, ...newEntries])
  }, [])

  const updateEntry = useCallback((id, field, value) => {
    setEntries((prev) => prev.map((e) => {
      if (e.id === id) return { ...e, [field]: value, ...(field === 'name' ? { nameEdited: true } : {}) }
      if (field === 'name' && !e.nameEdited) return { ...e, name: value }
      return e
    }))
  }, [])

  const removeEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (entries.length === 0) {
      setError('Please select at least one image for the archives.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const deviceId = getDeviceId()

      for (const entry of entries) {
        const fileExt = entry.file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('memory-images')
          .upload(fileName, entry.file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('memory-images')
          .getPublicUrl(fileName)

        const { error: insertError } = await supabase
          .from('memories')
          .insert({
            year: parseInt(entry.year),
            month: entry.month ? parseInt(entry.month) : null,
            day: entry.day ? parseInt(entry.day) : null,
            caption: entry.caption.trim() || null,
            name: entry.name.trim() || null,
            image_url: publicUrl,
            device_id: deviceId,
          })

        if (insertError) throw insertError
      }

      setSuccess(true)
    } catch (err) {
      console.error('Error:', err)
      setError('The scrolls could not be preserved. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
      <div className="upload-page">
        <div className="upload-border upload-border-top" />
        <div className="upload-success animate-fade-in">
          <div className="wax-seal" />
          <h2>{entries.length === 1 ? 'Your Memory Has Been Inscribed' : 'Your Memories Have Been Inscribed'}</h2>
          <p className="success-text">The archives have been updated.</p>
          <Link to="/timeline" className="view-timeline-btn">
            <button>View the Chronicles</button>
          </Link>
        </div>
        <div className="upload-border upload-border-bottom" />
      </div>
      </>
    )
  }

  return (
    <>
    {menuOpen && (
      <div className="fullscreen-menu">
        <button className="fullscreen-menu-close" onClick={() => setMenuOpen(false)}>
          &times;
        </button>
        <nav className="fullscreen-menu-nav">
          <Link to="/timeline" className="fullscreen-menu-item" onClick={() => setMenuOpen(false)}>
            View the Chronicles
          </Link>
          <div className="fullscreen-menu-separator">
            <div className="menu-wreath" />
          </div>
          <Link to="/" className="fullscreen-menu-item" onClick={() => setMenuOpen(false)}>
            Return to the Gates
          </Link>
        </nav>
      </div>
    )}
    <div className="upload-page">
      <div className="upload-border upload-border-top" />
      <div className="upload-container animate-fade-in">
        <Link to="/" className="back-link">Return to the Gates</Link>
        <div className="burger-wrapper">
          <button className="burger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="burger-line" />
            <span className="burger-line" />
            <span className="burger-line" />
          </button>
        </div>

        <h1 className="upload-title">Inscribe Your Memory</h1>
        <p className="upload-subtitle">Share a memory of you and César through the ages</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <ImageCapture onImagesSelect={handleImagesSelect} hasEntries={entries.length > 0} />

          {entries.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div className="entry-preview">
                <img src={entry.preview} alt="Preview" />
                <button
                  type="button"
                  className="entry-remove"
                  onClick={() => removeEntry(entry.id)}
                >
                  &times;
                </button>
              </div>

              <div className="form-group">
                <label>Anno Domini</label>
                <input
                  type="number"
                  value={entry.year}
                  onChange={(e) => updateEntry(entry.id, 'year', e.target.value)}
                  placeholder={currentYear.toString()}
                  min="1"
                  max="9999"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Month (Optional)</label>
                  <select
                    value={entry.month}
                    onChange={(e) => updateEntry(entry.id, 'month', e.target.value)}
                  >
                    <option value="">—</option>
                    <option value="1">Januarius</option>
                    <option value="2">Februarius</option>
                    <option value="3">Martius</option>
                    <option value="4">Aprilis</option>
                    <option value="5">Maius</option>
                    <option value="6">Junius</option>
                    <option value="7">Julius</option>
                    <option value="8">Augustus</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Day (Optional)</label>
                  <input
                    type="number"
                    value={entry.day}
                    onChange={(e) => updateEntry(entry.id, 'day', e.target.value)}
                    placeholder="—"
                    min="1"
                    max="31"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Your Words for the Ages</label>
                <textarea
                  value={entry.caption}
                  onChange={(e) => updateEntry(entry.id, 'caption', e.target.value)}
                  placeholder="Describe this moment..."
                  maxLength={300}
                  rows={3}
                />
                <span className="char-count">{entry.caption.length}/300</span>
              </div>

              <div className="form-group">
                <label>Your Name (Optional)</label>
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) => updateEntry(entry.id, 'name', e.target.value)}
                  placeholder="Anonymous scribe"
                />
              </div>
            </div>
          ))}

          {error && <p className="error-text">{error}</p>}

          {entries.length > 0 && (
            <button type="submit" disabled={loading} className="submit-btn">
              {loading
                ? 'Consulting the scribes...'
                : entries.length === 1
                  ? 'Inscribe to the Archives'
                  : `Inscribe ${entries.length} Memories to the Archives`}
            </button>
          )}
        </form>
      </div>
      <div className="upload-border upload-border-bottom" />
    </div>
    </>
  )
}

export default Upload
