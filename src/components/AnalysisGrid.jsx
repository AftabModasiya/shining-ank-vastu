import React from 'react';
import { Phone, Heart, Users, TrendingUp, Briefcase, Plane, Baby, Award } from 'lucide-react';
import './AnalysisGrid.css';
import gridConfig from '../config/analysisGridConfig.json';

const iconMap = {
  phone: Phone,
  heart: Heart,
  users: Users,
  "trending-up": TrendingUp,
  briefcase: Briefcase,
  plane: Plane,
  baby: Baby,
  award: Award
};

function AnalysisGrid({ clientData, onCardClick }) {
  return (
    <div className="analysis-grid-container">
      <div className="analysis-grid-header">
        <h2 className="analysis-grid-title">✨ Premium Vedic Analysis</h2>
        <p className="analysis-grid-subtitle">Tap any analysis card to open the Global Analysis Screen with real-time dynamic predictions.</p>
      </div>
      
      <div className="uniform-grid">
        {gridConfig.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Award;
          
          return (
            <div 
              key={item.id} 
              className="grid-card-wrapper"
              onClick={() => onCardClick(item)}
            >
              {/* InkWell / Splash Ripple Container */}
              <div className="card-inkwell">
                <div 
                  className="grid-card"
                  style={{
                    background: `linear-gradient(135deg, ${item.gradient[0]} 0%, ${item.gradient[1]} 100%)`
                  }}
                >
                  {/* Decorative Subtle Grid Lines inside card for luxury depth */}
                  <div className="card-overlay-grid"></div>
                  
                  {/* Top Left Tag Chip */}
                  <div className="card-tag-pill">
                    <span className="card-tag-text">{item.tag.toUpperCase()}</span>
                  </div>

                  {/* Center Left Neon/3D Vector Icon */}
                  <div className="card-icon-container">
                    <div className="neon-glow-backdrop"></div>
                    <IconComponent className="card-neon-icon" size={36} strokeWidth={1.5} />
                  </div>

                  {/* Bottom Info Section */}
                  <div className="card-bottom-info">
                    <h3 className="card-title">{item.title}</h3>
                    <div className="card-subtext-row">
                      {item.subtext.split('•').map((sub, sIdx) => (
                        <React.Fragment key={sIdx}>
                          {sIdx > 0 && <span className="subtext-divider">•</span>}
                          <span className="card-subtext-item">{sub.trim()}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AnalysisGrid;
