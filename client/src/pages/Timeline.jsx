import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDeviceId } from '../lib/deviceId'
import MemoryCard from '../components/MemoryCard'
import YearDivider from '../components/YearDivider'
import './Timeline.css'

function Timeline() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
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

    const handleResize = () => setIsMobile(window.innerWidth <= 600)
    window.addEventListener('resize', handleResize)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (diff > threshold && currentIndex < memories.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (diff < -threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToCard = (index) => {
    setCurrentIndex(index)
  }

  const handleDelete = async (memoryId) => {
    try {
      const { data, error } = await supabase.rpc('delete_own_memory', {
        memory_id: memoryId,
        user_device_id: deviceId,
      })

      if (error) throw error
      if (!data) throw new Error('Not authorized to delete this memory')

      setMemories((prev) => prev.filter((m) => m.id !== memoryId))
      if (currentIndex >= memories.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
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

  const groupByYear = (memories) => {
    const groups = {}
    memories.forEach((memory) => {
      if (!groups[memory.year]) {
        groups[memory.year] = []
      }
      groups[memory.year].push(memory)
    })
    return groups
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

  const groupedMemories = groupByYear(memories)
  const years = Object.keys(groupedMemories).sort((a, b) => Number(a) - Number(b))

  return (
    <div className="timeline-page">
      <div className="timeline-header animate-fade-in">
        <Link to="/" className="back-link">Return to the Gates</Link>
        <h1 className="timeline-title">The Chronicles</h1>
        <p className="timeline-subtitle">Memories preserved through the ages</p>
      </div>

      {memories.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <p>The archives await their first inscription.</p>
          <Link to="/upload">
            <button>Add the First Memory</button>
          </Link>
        </div>
      ) : isMobile ? (
        <div className="mobile-carousel">
          <div
            className="carousel-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <MemoryCard
              key={memories[currentIndex].id}
              memory={memories[currentIndex]}
              canDelete={memories[currentIndex].device_id === deviceId}
              onDelete={handleDelete}
            />
          </div>
          <div className="carousel-nav">
            <button
              className="nav-arrow"
              onClick={() => goToCard(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              &larr;
            </button>
            <span className="carousel-counter">
              {currentIndex + 1} / {memories.length}
            </span>
            <button
              className="nav-arrow"
              onClick={() => goToCard(currentIndex + 1)}
              disabled={currentIndex === memories.length - 1}
            >
              &rarr;
            </button>
          </div>
          <div className="carousel-dots">
            {memories.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => goToCard(idx)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="timeline-content">
          {years.map((year, yearIndex) => (
            <div key={year} className="year-section">
              <YearDivider year={parseInt(year)} />
              <div className="memories-grid">
                {groupedMemories[year].map((memory, idx) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    delay={yearIndex === 0 ? idx * 100 : 0}
                    canDelete={memory.device_id === deviceId}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/upload" className="add-memory-fab" title="Add a memory">
        <span>+</span>
      </Link>
    </div>
  )
}

export default Timeline
