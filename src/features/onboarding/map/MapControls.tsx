interface Props {
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Floating glass buttons (Apple Maps style) for zooming without a pinch. */
export function MapControls({ canZoomOut, onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div className="bdmap-controls">
      <div className="bdmap-control-group">
        <button type="button" onClick={onZoomIn} aria-label="Zoom in">
          {icon('M12 5v14M5 12h14')}
        </button>
        <button type="button" onClick={onZoomOut} disabled={!canZoomOut} aria-label="Zoom out">
          {icon('M5 12h14')}
        </button>
      </div>
      {canZoomOut && (
        <button type="button" className="bdmap-control-single" onClick={onReset} aria-label="Show the whole map">
          {icon('M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5')}
        </button>
      )}
    </div>
  );
}
