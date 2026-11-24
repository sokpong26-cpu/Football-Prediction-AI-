import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class FirebaseErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070e09] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-3xl bg-[#0c1710] border border-red-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">System Recovery Notice</h2>
                <p className="text-xs text-gray-400">A protected data operation encountered an error.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-gray-800 text-xs font-mono text-red-300 break-words max-h-40 overflow-y-auto">
              {this.state.errorMessage}
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>Recover Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
