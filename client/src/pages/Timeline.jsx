import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDeviceId } from '../lib/deviceId'
import { toRomanNumerals } from '../utils/romanNumerals'
import MemoryCard from '../components/MemoryCard'
import './Timeline.css'

function Timeline() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentYear, setCurrentYear] = useState(null)
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [viewMode, setViewMode] = useState('carousel')
  const [menuOpen, setMenuOpen] = useState(false)
  const [galleryCols, setGalleryCols] = useState(window.innerWidth <= 600 ? 2 : 3)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeExiting, setSwipeExiting] = useState(null) // 'left' | 'right' | null
  const touchStartX = useRef(0)
  const isMobile = galleryCols <= 2
  const rowRef = useRef(null)
  const cardRefs = useRef([])
  const deviceId = getDeviceId()

  useEffect(() => {
    fetchMemories()

    const channel = supabase
      .channel('memories')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'memories' },
        (payload) => {
          setMemories((prev) => {
            const updated = [...prev, payload.new]
            return updated.sort((a, b) => a.year - b.year)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (memories.length > 0 && currentYear === null) {
      setCurrentYear(memories[0].year)
    }
  }, [memories, currentYear])

  useEffect(() => {
    const handleResize = () => {
      setGalleryCols(window.innerWidth <= 600 ? 2 : 3)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (viewMode !== 'carousel') return
    const row = rowRef.current
    if (!row) return

    let snapTimer = null

    const handleWheel = (e) => {
      e.preventDefault()
      row.scrollLeft += e.deltaY + e.deltaX

      clearTimeout(snapTimer)
      snapTimer = setTimeout(() => {
        const rowRect = row.getBoundingClientRect()
        const centerX = rowRect.left + rowRect.width / 2
        let closestEl = null
        let closestDist = Infinity

        cardRefs.current.forEach((el) => {
          if (!el) return
          const rect = el.getBoundingClientRect()
          const dist = Math.abs(rect.left + rect.width / 2 - centerX)
          if (dist < closestDist) {
            closestDist = dist
            closestEl = el
          }
        })

        if (closestEl) {
          closestEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
        }
      }, 100)
    }

    row.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      row.removeEventListener('wheel', handleWheel)
      clearTimeout(snapTimer)
    }
  }, [memories, viewMode])

  const handleScroll = useCallback(() => {
    const row = rowRef.current
    if (!row || memories.length === 0) return

    const rowRect = row.getBoundingClientRect()
    const centerX = rowRect.left + rowRect.width / 2

    let closestIdx = 0
    let closestDist = Infinity

    cardRefs.current.forEach((el, idx) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cardCenter = rect.left + rect.width / 2
      const dist = Math.abs(cardCenter - centerX)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = idx
      }
    })

    if (memories[closestIdx]) {
      setCurrentYear(memories[closestIdx].year)
      setFocusedIdx(closestIdx)
    }
  }, [memories])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    setIsSwiping(true)
    setSwipeExiting(null)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isSwiping) return
    const diff = e.touches[0].clientX - touchStartX.current
    setSwipeOffset(diff)
  }, [isSwiping])

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false)
    const threshold = 80
    if (swipeOffset < -threshold && focusedIdx < memories.length - 1) {
      // Animate to full left (-100vw)
      setSwipeOffset(-window.innerWidth)
      setSwipeExiting('left')
      setTimeout(() => {
        setSwipeExiting(null)
        setSwipeOffset(0)
        const next = focusedIdx + 1
        setFocusedIdx(next)
        if (memories[next]) setCurrentYear(memories[next].year)
      }, 250)
    } else if (swipeOffset > threshold && focusedIdx > 0) {
      // Animate to full right (+100vw)
      setSwipeOffset(window.innerWidth)
      setSwipeExiting('right')
      setTimeout(() => {
        setSwipeExiting(null)
        setSwipeOffset(0)
        const prev = focusedIdx - 1
        setFocusedIdx(prev)
        if (memories[prev]) setCurrentYear(memories[prev].year)
      }, 250)
    } else {
      setSwipeOffset(0)
    }
  }, [swipeOffset, focusedIdx, memories])

  const handleDelete = async (memoryId) => {
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId)
        .eq('device_id', deviceId)

      if (error) throw error

      setMemories((prev) => prev.filter((m) => m.id !== memoryId))
    } catch (err) {
      console.error('Error deleting memory:', err)
    }
  }

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('year', { ascending: true })

      if (error) throw error
      setMemories(data || [])
    } catch (err) {
      console.error('Error fetching memories:', err)
      setError('The archives could not be retrieved.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="timeline-page">
        <p className="loading-text">The Archives are being consulted...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="timeline-page">
        <p className="error-text">{error}</p>
        <Link to="/" className="back-link">Return to the Gates</Link>
      </div>
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
          <h3 className="fullscreen-menu-heading">Display Options</h3>
          <button
            className={`fullscreen-menu-item ${viewMode === 'carousel' ? 'active' : ''}`}
            onClick={() => { setViewMode('carousel'); setMenuOpen(false) }}
          >
            Carousel
          </button>
          <button
            className={`fullscreen-menu-item ${viewMode === 'gallery' ? 'active' : ''}`}
            onClick={() => { setViewMode('gallery'); setMenuOpen(false) }}
          >
            Gallery
          </button>
          <div className="fullscreen-menu-separator">
            <div className="menu-wreath" />
          </div>
          <Link to="/upload" className="fullscreen-menu-item" onClick={() => setMenuOpen(false)}>
            Add a Memory
          </Link>
          <Link to="/" className="fullscreen-menu-item" onClick={() => setMenuOpen(false)}>
            Return to the Gates
          </Link>
        </nav>
      </div>
    )}
    <div className="timeline-page">
      <div className="timeline-flow-border timeline-flow-border-top" />
      <div className="timeline-header animate-fade-in">
        <Link to="/" className="back-link">Return to the Gates</Link>
        <h1 className="timeline-title">The Chronicles</h1>
        <div className="view-tabs-wrapper">
          <div className="view-tabs">
            <button
              className={`view-tab ${viewMode === 'carousel' ? 'active' : ''}`}
              onClick={() => setViewMode('carousel')}
            >
              Carousel
            </button>
            <button
              className={`view-tab ${viewMode === 'gallery' ? 'active' : ''}`}
              onClick={() => setViewMode('gallery')}
            >
              Gallery
            </button>
          </div>
        </div>
        <div className="burger-wrapper">
          <button className="burger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="burger-line" />
            <span className="burger-line" />
            <span className="burger-line" />
          </button>
        </div>

        {currentYear && viewMode === 'carousel' && (
          <div className="timeline-year-group">
            <div className="timeline-year-row">
              <img src="/laurel-wreath.png" alt="" className="year-wreath" />
              <h2 className="timeline-year">{toRomanNumerals(currentYear)}</h2>
              <img src="/laurel-wreath.png" alt="" className="year-wreath" />
            </div>
            <span className="timeline-year-arabic">{currentYear}</span>
          </div>
        )}
      </div>

      {memories.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <p>The archives await their first inscription.</p>
          <Link to="/upload">
            <button>Add the First Memory</button>
          </Link>
        </div>
      ) : viewMode === 'carousel' ? (
        isMobile ? (
          <div
            className="swipe-deck"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {memories.map((memory, idx) => {
              if (idx < focusedIdx - 1 || idx > focusedIdx + 1) return null
              const isActive = idx === focusedIdx
              const isNext = idx === focusedIdx + 1
              const isPrev = idx === focusedIdx - 1
              const swipingRight = swipeOffset > 0
              const isBehind = swipingRight ? isPrev : isNext
              let style = {}
              if (isActive) {
                const rotation = swipeOffset * 0.04
                const offsetVw = (swipeOffset / window.innerWidth) * 100
                style = {
                  transform: swipeExiting
                    ? `translateX(${offsetVw}vw)`
                    : `translateX(${swipeOffset}px) rotate(${rotation}deg)`,
                  transition: swipeExiting || !isSwiping ? 'transform 0.25s ease-out' : 'none',
                  zIndex: 2,
                }
              } else if (isNext || isPrev) {
                // Cards sit off-screen and follow the active card's movement
                const offsetVw = (swipeOffset / window.innerWidth) * 100
                const baseX = isNext ? 100 : -100
                const x = baseX + offsetVw
                style = {
                  transform: `translateX(${x}vw)`,
                  transition: !isSwiping ? 'transform 0.25s ease-out, opacity 0.25s ease-out' : 'none',
                  zIndex: 1,
                  opacity: 1,
                }
              } else {
                return null
              }
              return (
                <div
                  key={memory.id}
                  className="swipe-card"
                  style={style}
                >
                  <MemoryCard
                    memory={memory}
                    canDelete={memory.device_id === deviceId}
                    onDelete={handleDelete}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="memories-row"
            ref={rowRef}
            onScroll={handleScroll}
          >
            <div className="memories-row-spacer" />
            {memories.map((memory, idx) => (
              <div
                key={memory.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                className={`memory-row-item ${idx === focusedIdx ? 'focused' : ''}`}
              >
                <MemoryCard
                  memory={memory}
                  canDelete={memory.device_id === deviceId}
                  onDelete={handleDelete}
                />
              </div>
            ))}
            <div className="memories-row-spacer" />
          </div>
        )
      ) : (
        <div className="memories-gallery">
          {(() => {
            const numCols = galleryCols
            const columns = Array.from({ length: numCols }, () => [])
            memories.forEach((memory, idx) => {
              columns[idx % numCols].push(memory)
            })
            return columns.map((col, colIdx) => (
              <div key={colIdx} className="gallery-column">
                {col.map((memory) => (
                  <div key={memory.id} className="gallery-item">
                    <MemoryCard
                      memory={memory}
                      canDelete={memory.device_id === deviceId}
                      onDelete={handleDelete}
                      gallery
                    />
                  </div>
                ))}
              </div>
            ))
          })()}
        </div>
      )}

      <Link to="/upload" className="add-memory-fab" title="Add a memory">
        <span>+</span>
      </Link>
      <div className="timeline-flow-border timeline-flow-border-bottom" />
    </div>
    </>
  )
}

export default Timeline
