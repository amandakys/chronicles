import { useRef } from 'react'
import exifr from 'exifr'
import './ImageCapture.css'

function ImageCapture({ onImageSelect, preview }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      let dateTaken = null
      try {
        const exif = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate', 'ModifyDate'])
        const dateField = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate
        if (dateField) {
          dateTaken = new Date(dateField)
        }
      } catch (err) {
        console.log('Could not read EXIF data:', err)
      }
      onImageSelect(file, dateTaken)
    }
  }

  return (
    <div className="image-capture">
      <label>Image for the Archives</label>

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}

      <div className="capture-buttons">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="capture-btn"
        >
          Upload from Device
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="capture-btn"
        >
          Capture Photo
        </button>
      </div>
    </div>
  )
}

export default ImageCapture
