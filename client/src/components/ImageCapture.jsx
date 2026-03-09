import { useRef } from 'react'
import exifr from 'exifr'
import './ImageCapture.css'

async function extractDate(file) {
  try {
    const exif = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate', 'ModifyDate'])
    const dateField = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate
    if (dateField) return new Date(dateField)
  } catch (err) {
    console.log('Could not read EXIF data:', err)
  }
  return null
}

function ImageCapture({ onImagesSelect, hasEntries }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const results = await Promise.all(
      files.map(async (file) => ({
        file,
        dateTaken: await extractDate(file),
      }))
    )
    onImagesSelect(results)
    e.target.value = ''
  }

  return (
    <div className="image-capture">
      <label>{hasEntries ? 'Add More Images' : 'Images for the Archives'}</label>

      <div className="capture-buttons">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
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
