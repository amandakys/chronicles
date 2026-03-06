import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDeviceId } from '../lib/deviceId'
import ImageCapture from '../components/ImageCapture'
import './Upload.css'

function Upload() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [caption, setCaption] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleImageSelect = (file, dateTaken) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
    if (dateTaken && !isNaN(dateTaken.getFullYear())) {
      setYear(dateTaken.getFullYear())
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
      <div className="upload-page">
        <div className="upload-success animate-fade-in">
          <div className="wax-seal">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="var(--accent)"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#6b1515" strokeWidth="3"/>
              <text x="50" y="58" textAnchor="middle" fill="var(--primary)" fontSize="24" fontFamily="Cinzel Decorative">S</text>
            </svg>
          </div>
          <h2>Your Memory Has Been Inscribed</h2>
          <p className="success-text">The archives have been updated.</p>
          <Link to="/timeline" className="view-timeline-btn">
            <button>View the Chronicles</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-page">
      <div className="upload-container animate-fade-in">
        <Link to="/" className="back-link">Return to the Gates</Link>

        <h1 className="upload-title">Inscribe Your Memory</h1>
        <p className="upload-subtitle">Preserve a moment for eternity</p>

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
  )
}

export default Upload
