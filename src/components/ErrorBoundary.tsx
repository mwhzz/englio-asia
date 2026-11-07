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
/** A screen's code couldn't be downloaded (offline, before it was saved): not a bug, just no internet. */
const isOfflineLoad = (error: unknown) =>
  !navigator.onLine || /dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoadError|error loading dynamically/i.test(String((error as Error)?.message ?? error));

export class ErrorBoundary extends Component<Props, { failed: boolean; offline: boolean }> {
  state = { failed: false, offline: false };

  static getDerivedStateFromError(error: unknown) {
    return { failed: true, offline: isOfflineLoad(error) };
  }

  componentDidCatch(error: unknown) {
    if (!isOfflineLoad(error)) reportError(error, this.props.where);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const home = this.props.onHome;
    return (
      <div className="crash" role="alert">
        <h1 lang="bn">{this.state.offline ? 'এই পাতাটা খুলতে নেট লাগবে' : 'কিছু একটা গোলমাল হয়েছে'}</h1>
        <p lang="bn">
          {this.state.offline
            ? 'নেট এলে একবার খুললেই পরে নেট ছাড়াও চলবে। ততক্ষণ হোমের লেসনগুলো করতে পারো।'
            : 'তোমার অগ্রগতি ঠিক আছে। আমরা সমস্যাটার খবর পেয়েছি।'}
        </p>
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
