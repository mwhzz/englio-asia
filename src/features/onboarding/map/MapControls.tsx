import { Glyph } from '../../../components/Glyph';

interface Props {
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}


/** Floating glass buttons (Apple Maps style) for zooming without a pinch. */
export function MapControls({ canZoomOut, onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div className="bdmap-controls">
      <div className="bdmap-control-group">
        <button type="button" onClick={onZoomIn} aria-label="Zoom in">
          <Glyph name="plus" size={18} />
        </button>
        <button type="button" onClick={onZoomOut} disabled={!canZoomOut} aria-label="Zoom out">
          <Glyph name="minus" size={18} />
        </button>
      </div>
      {canZoomOut && (
        <button type="button" className="bdmap-control-single" onClick={onReset} aria-label="Show the whole map">
          <Glyph name="expand" size={18} />
        </button>
      )}
    </div>
  );
}
