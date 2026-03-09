import { useState, useRef, useCallback } from 'react'
import './MemoryCard.css'

const MONTHS = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

function formatDate(memory) {
  const parts = []
  if (memory.day) parts.push(memory.day)
  if (memory.month) parts.push(MONTHS[memory.month])
  return parts.length > 0 ? parts.join(' ') + ', ' : ''
}

function MemoryCard({ memory, delay = 0, canDelete = false, onDelete, gallery = false }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [galleryStage, setGalleryStage] = useState(null) // null | 'image' | 'message'
  const [galleryDismissing, setGalleryDismissing] = useState(false)
  const pressTimer = useRef(null)
  const didLongPress = useRef(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete?.(memory.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const handlePointerDown = useCallback(() => {
    if (!gallery) return
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setExpanded(true)
    }, 400)
  }, [gallery])

  const handlePointerUp = useCallback(() => {
    if (!gallery) return
    clearTimeout(pressTimer.current)
    if (didLongPress.current) {
      setExpanded(false)
    }
  }, [gallery])

  const handlePointerCancel = useCallback(() => {
    clearTimeout(pressTimer.current)
    setExpanded(false)
  }, [])

  const handleClick = () => {
    if (gallery) {
      if (didLongPress.current) {
        didLongPress.current = false
        return
      }
      if (window.innerWidth > 600) {
        setIsFlipped(!isFlipped)
      } else {
        setGalleryStage('image')
      }
    } else {
      setIsFlipped(!isFlipped)
    }
  }

  const handleOverlayClick = () => {
    if (galleryStage === 'image') {
      setGalleryStage('message')
    } else {
      setGalleryDismissing(true)
      setTimeout(() => {
        setGalleryStage(null)
        setGalleryDismissing(false)
      }, 250)
    }
  }

  return (
    <>
      <div
        className={`memory-card-container animate-fade-in-up ${gallery ? 'gallery-mode' : ''}`}
        style={{ animationDelay: `${delay}ms` }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={gallery ? (e) => e.preventDefault() : undefined}
      >
        <div className={`memory-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="card-face card-front">
            <div className="card-image-wrapper">
              <img
                src={memory.image_url}
                alt={memory.caption || 'Memory'}
                loading="lazy"
                draggable={false}
              />
            </div>
            <div className="card-overlay">
              <span className="card-year">{formatDate(memory)}{memory.year}</span>
              {memory.name && <span className="card-name">{memory.name}</span>}
            </div>
            <div className="card-corner top-left"></div>
            <div className="card-corner top-right"></div>
            <div className="card-corner bottom-left"></div>
            <div className="card-corner bottom-right"></div>
          </div>
          <div className="card-face card-back">
            <div
              className="card-back-bg"
              style={{ backgroundImage: `url(${memory.image_url})` }}
            />
            <div className="card-back-inner">
              <p className="card-caption">{memory.caption || 'A moment preserved in time.'}</p>
              <div className="card-back-footer">
                {memory.name && <span className="card-back-name">{memory.name}</span>}
                <span className="card-back-year">{formatDate(memory)}{memory.year} A.D.</span>
                {canDelete && (
                  <button className="delete-btn" onClick={handleDelete}>
                    {confirmDelete ? 'Confirm?' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
            <div className="card-corner top-left"></div>
            <div className="card-corner top-right"></div>
            <div className="card-corner bottom-left"></div>
            <div className="card-corner bottom-right"></div>
          </div>
        </div>
      </div>

      {/* Fullscreen image expand (long press - dismisses on release) */}
      {expanded && (
        <div className="fullscreen-overlay">
          <img
            src={memory.image_url}
            alt={memory.caption || 'Memory'}
            className="fullscreen-image"
          />
        </div>
      )}

      {/* Fullscreen gallery card (tap to expand → tap to flip → tap to dismiss) */}
      {galleryStage && (
        <div className={`fullscreen-overlay ${galleryDismissing ? 'dismissing' : ''}`} onClick={handleOverlayClick}>
          <div className={`fullscreen-flip-container ${galleryStage === 'message' ? 'flipped' : ''} ${galleryDismissing ? 'dismissing' : ''}`}>
            <div className="fullscreen-flip-front">
              <img
                src={memory.image_url}
                alt={memory.caption || 'Memory'}
                className="fullscreen-image"
              />
              <div className="card-overlay">
                <span className="card-year">{formatDate(memory)}{memory.year}</span>
                {memory.name && <span className="card-name">{memory.name}</span>}
              </div>
              <div className="card-corner top-left"></div>
              <div className="card-corner top-right"></div>
              <div className="card-corner bottom-left"></div>
              <div className="card-corner bottom-right"></div>
            </div>
            <div className="fullscreen-flip-back">
              <div className="fullscreen-card">
                <div
                  className="card-back-bg"
                  style={{ backgroundImage: `url(${memory.image_url})` }}
                />
                <div className="card-back-inner">
                  <p className="card-caption">{memory.caption || 'A moment preserved in time.'}</p>
                  <div className="card-back-footer">
                    {memory.name && <span className="card-back-name">{memory.name}</span>}
                    <span className="card-back-year">{formatDate(memory)}{memory.year} A.D.</span>
                    {canDelete && (
                      <button className="delete-btn" onClick={handleDelete}>
                        {confirmDelete ? 'Confirm?' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-corner top-left"></div>
                <div className="card-corner top-right"></div>
                <div className="card-corner bottom-left"></div>
                <div className="card-corner bottom-right"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MemoryCard
