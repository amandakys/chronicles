import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDeviceId } from '../lib/deviceId'
import ImageCapture from '../components/ImageCapture'
import './Upload.css'

function Upload() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [caption, setCaption] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleImageSelect = (file, dateTaken) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
    if (dateTaken && !isNaN(dateTaken.getFullYear())) {
      setYear(dateTaken.getFullYear())
      setMonth(dateTaken.getMonth() + 1)
      setDay(dateTaken.getDate())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!image) {
      setError('Please select an image for the archives.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fileExt = image.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('memory-images')
        .upload(fileName, image)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('memory-images')
        .getPublicUrl(fileName)

      const { error: insertError } = await supabase
        .from('memories')
        .insert({
          year: parseInt(year),
          month: month ? parseInt(month) : null,
          day: day ? parseInt(day) : null,
          caption: caption.trim() || null,
          name: name.trim() || null,
          image_url: publicUrl,
          device_id: getDeviceId(),
        })

      if (insertError) throw insertError

      setSuccess(true)
    } catch (err) {
      console.error('Error:', err)
      setError('The scroll could not be preserved. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
      <div className="border-bar border-top" />
      <div className="border-bar border-bottom" />
      <div className="upload-page">
        <div className="upload-success animate-fade-in">
          <div className="wax-seal" />
          <h2>Your Memory Has Been Inscribed</h2>
          <p className="success-text">The archives have been updated.</p>
          <Link to="/timeline" className="view-timeline-btn">
            <button>View the Chronicles</button>
          </Link>
        </div>
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
    <div className="border-bar border-top" />
    <div className="border-bar border-bottom" />
    <div className="upload-page">
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
          <ImageCapture onImageSelect={handleImageSelect} preview={preview} />

          <div className="form-group">
            <label htmlFor="year">Anno Domini (auto-detected from photo)</label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={new Date().getFullYear().toString()}
              min="1"
              max="9999"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="month">Month (Optional)</label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
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
              <label htmlFor="day">Day (Optional)</label>
              <input
                type="number"
                id="day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="—"
                min="1"
                max="31"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="caption">Your Words for the Ages</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this moment..."
              maxLength={300}
              rows={4}
            />
            <span className="char-count">{caption.length}/300</span>
          </div>

          <div className="form-group">
            <label htmlFor="name">Your Name (Optional)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous scribe"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Consulting the scribes...' : 'Inscribe to the Archives'}
          </button>
        </form>
      </div>
    </div>
    </>
  )
}

export default Upload
