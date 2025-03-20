import React from 'react';
import '../styles/fonts.css';

const DuaCard = ({ dua, language = 'en' }) => {
  return (
    <div className="dua-card">
      <h2>{dua.name}</h2>
      <div className="dua-content">
        <div className="arabic-section">
          <p className="arabic-text">{dua.arabic_text}</p>
          <small>Reference: {dua.reference}</small>
        </div>
        
        <div className="translations">
          {language === 'ur' && dua.urdu_translation && (
            <div className="urdu-section">
              <p className="urdu-text">{dua.urdu_translation}</p>
            </div>
          )}
          
          <div className="english-section">
            <p>{dua.translation}</p>
          </div>
        </div>
        
        <div className="dua-details">
          <p className="description">{dua.description}</p>
          {dua.count && <p className="count">Recite: {dua.count}</p>}
        </div>
      </div>
    </div>
  );
};

export default DuaCard; 