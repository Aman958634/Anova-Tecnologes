import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen grid place-items-center bg-[#071c46] px-4 text-white" role="main">
          <section className="max-w-xl rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-3 text-sm text-white/80">
              An unexpected error occurred. Please refresh this page. If the issue persists, contact support.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-md bg-[#2f6df7] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245fe0]"
            >
              Reload page
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
