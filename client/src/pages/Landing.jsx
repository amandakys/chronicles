import { Link } from 'react-router-dom'
import './Landing.css'

function Landing() {
  return (
    <div className="landing">
      <div className="landing-content animate-fade-in">
        <h1 className="landing-title">Chronicles of César</h1>
        <p className="landing-tagline">Celebrating 35 Years of Rule</p>

        <div className="arch-container">
          <Link to="/upload" className="arch-card">
            <div className="arch">
              <div className="arch-image" />
              <div className="arch-inner">
                <span className="arch-label">Add Your Memory</span>
              </div>
            </div>
          </Link>

          <Link to="/timeline" className="arch-card">
            <div className="arch">
              <div className="arch-image" />
              <div className="arch-inner">
                <span className="arch-label">View the Chronicles</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="landing-footer">
          <div className="decorative-line"></div>
          <p className="footer-text">Share your moments with César through the ages</p>
        </div>
      </div>
    </div>
  )
}

export default Landing
