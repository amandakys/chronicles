import { useState } from 'react'
import { toRomanNumerals } from '../utils/romanNumerals'
import './MemoryCard.css'

function MemoryCard({ memory, delay = 0, canDelete = false, onDelete }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete?.(memory.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div
      className="memory-card-container animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`memory-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-face card-front">
          <div className="card-image-wrapper">
            <img
              src={memory.image_url}
              alt={memory.caption || 'Memory'}
              loading="lazy"
            />
          </div>
          <div className="card-overlay">
            <span className="card-year">{toRomanNumerals(memory.year)}</span>
            {memory.name && <span className="card-name">{memory.name}</span>}
          </div>
          <div className="card-corner top-left"></div>
          <div className="card-corner top-right"></div>
          <div className="card-corner bottom-left"></div>
          <div className="card-corner bottom-right"></div>
        </div>
        <div className="card-face card-back">
          <div className="card-back-inner">
            <p className="card-caption">{memory.caption || 'A moment preserved in time.'}</p>
            <div className="card-back-footer">
              {memory.name && <span className="card-back-name">{memory.name}</span>}
              <span className="card-back-year">{toRomanNumerals(memory.year)} A.D.</span>
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
  )
}

export default MemoryCard
