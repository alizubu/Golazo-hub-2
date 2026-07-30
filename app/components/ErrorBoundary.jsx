'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, Btn } from './UI';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 border-destructive/30 bg-destructive/5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-destructive mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            An unexpected error occurred in this section of the app. 
          </p>
          <div className="flex gap-3">
            <Btn 
              variant="outline" 
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </Btn>
            <Btn onClick={() => window.location.reload()}>
              <RefreshCw size={14} className="mr-2" /> Reload Page
            </Btn>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-6 p-4 bg-black/50 rounded-lg text-left text-xs font-mono text-red-400 overflow-auto w-full max-w-full">
              {this.state.error.toString()}
            </div>
          )}
        </Card>
      );
    }
    return this.props.children; 
  }
}
