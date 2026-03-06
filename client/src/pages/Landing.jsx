import { Link } from 'react-router-dom'
import './Landing.css'

function Landing() {
  return (
    <div className="landing">
      <div className="landing-content animate-fade-in">
        <h1 className="landing-title">Chronicles of César</h1>
        <p className="landing-tagline">Memoria Aeterna</p>

        <div className="arch-container">
          <Link to="/upload" className="arch-card">
            <div className="arch">
              <div className="arch-top"></div>
              <div className="arch-pillar left"></div>
              <div className="arch-pillar right"></div>
              <div className="arch-inner">
                <div className="arch-text">
                  <span className="arch-icon">+</span>
                  <span className="arch-label">Add Your Memory</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/timeline" className="arch-card">
            <div className="arch">
              <div className="arch-top"></div>
              <div className="arch-pillar left"></div>
              <div className="arch-pillar right"></div>
              <div className="arch-inner">
                <div className="arch-text">
                  <span className="arch-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </span>
                  <span className="arch-label">View the Chronicles</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="landing-footer">
          <div className="decorative-line"></div>
          <p className="footer-text">Share your moments through the ages</p>
        </div>
      </div>
    </div>
  )
}

export default Landing
