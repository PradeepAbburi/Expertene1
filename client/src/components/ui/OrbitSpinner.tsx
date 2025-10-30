import React from 'react';

export default function OrbitSpinner({ size = 56 }: { size?: number }) {
  const s = size;
  const center = s / 2;
  const ring = s * 0.6;
  const dot = Math.max(4, Math.floor(s * 0.08));
  const wrapperStyle: React.CSSProperties = { width: s, height: s };

  return (
    <div style={wrapperStyle} className="orbit-spinner" aria-hidden>
      <style>{`
        .orbit-spinner{display:inline-block;position:relative}
        .orbit-spinner .orbit-ring{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
        .orbit-spinner .orbit-track{width:100%;height:100%;border-radius:50%;opacity:.06;background:currentColor}
        .orbit-spinner .orbit-dot{position:absolute;left:50%;top:50%;transform-origin: -${center}px 0px}
        .orbit-spinner .dot-inner{width:${dot}px;height:${dot}px;border-radius:9999px;background:currentColor;box-shadow:0 6px 18px rgba(59,130,246,0.25)}
        @keyframes orbit-rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        /* slightly slower, smoother rotation */
        .orbit-spinner .orbit-rot{position:absolute;inset:0;animation:orbit-rotate 1.2s linear infinite}
      `}</style>

      <div className="orbit-ring">
        <div className="orbit-track" />
        <div className="orbit-rot">
          <div className="orbit-dot" style={{ transform: `translate(${ring / 2}px, -${dot / 2}px)` }}>
            <div className="dot-inner" />
          </div>
        </div>
      </div>
    </div>
  );
}

