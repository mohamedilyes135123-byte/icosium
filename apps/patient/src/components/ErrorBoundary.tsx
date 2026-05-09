"use client";
import React, { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<{children: ReactNode, fallback: (e: Error) => ReactNode}, {error: Error | null}> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}
