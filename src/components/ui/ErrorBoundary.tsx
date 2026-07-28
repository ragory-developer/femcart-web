"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Bug } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate a unique ID for this client-side crash
    const errorId = `UI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, this would be sent to Sentry, DataDog, etc.
    // For now, we log professionally to the console with the reference ID.
    console.error(
      `[Error Reference: ${this.state.errorId}] Uncaught UI exception in ${this.props.componentName || "ErrorBoundary"}:`,
    );
    console.error(error);
    console.error(errorInfo.componentStack);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV === "development";

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-pink-50/50 border border-pink-100 rounded-lg text-center shadow-sm w-full h-full min-h-[200px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 mb-4 shadow-inner">
            <AlertTriangle className="h-6 w-6 text-pink-600" />
          </div>

          <h3 className="text-base font-black text-pink-900 mb-2 tracking-tight">
            Oops! Something went wrong.
          </h3>

          <p className="text-xs text-pink-700/80 max-w-[280px] mb-4 font-medium leading-relaxed">
            {isDev
              ? "Development Mode: See the exact error below."
              : "We're having trouble loading this section. Our engineering team has been notified."}
          </p>

          {/* Error Reference ID Block */}
          {!isDev && this.state.errorId && (
            <div className="bg-white/50 border border-pink-200 rounded-lg px-3 py-1.5 mb-5 flex items-center gap-2">
              <Bug size={12} className="text-pink-400" />
              <span className="text-[10px] font-mono text-pink-800 font-bold tracking-widest">
                REF: {this.state.errorId}
              </span>
            </div>
          )}

          {/* Developer Stack Trace Output */}
          {isDev && this.state.error && (
            <div className="w-full max-w-md bg-white border border-pink-200 rounded-xl p-3 mb-5 text-left overflow-hidden">
              <p className="text-xs font-bold text-pink-600 mb-1 font-mono truncate">
                {this.state.error.name}: {this.state.error.message}
              </p>
              <div className="max-h-32 overflow-y-auto">
                <pre className="text-[9px] text-gray-500 font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {this.state.error.stack}
                </pre>
              </div>
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow-md active:scale-95"
          >
            <RefreshCcw size={14} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
