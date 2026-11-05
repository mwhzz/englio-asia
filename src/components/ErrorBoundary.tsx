import { Component, type ReactNode } from 'react';
import { reportError } from '../lib/reportError';

interface Props {
  children: ReactNode;
  /** Leave the broken screen (e.g. back to the home tab). Without it, the app reloads. */
  onHome?: () => void;
  /** Where in the app, for the error report. */
  where: string;
}

/** Instead of a blank white screen when something breaks: a calm message, try again or go home. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    reportError(error, this.props.where);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const home = this.props.onHome;
    return (
      <div className="crash" role="alert">
        <h1 lang="bn">কিছু একটা গোলমাল হয়েছে</h1>
        <p lang="bn">তোমার অগ্রগতি ঠিক আছে। আমরা সমস্যাটার খবর পেয়েছি।</p>
        <div className="cta-stack">
          <button className="cta" onClick={() => this.setState({ failed: false })}>
            <span lang="bn">আবার চেষ্টা করো</span>
          </button>
          <button
            className="cta-text"
            onClick={() => {
              this.setState({ failed: false });
              if (home) home();
              else location.reload();
            }}
          >
            <span lang="bn">হোমে ফিরে যাও</span>
          </button>
        </div>
      </div>
    );
  }
}
