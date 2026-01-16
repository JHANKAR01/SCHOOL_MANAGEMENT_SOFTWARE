import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class NebulaErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Nebula Visualizer Error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-[50vh] w-full p-4">
                    <div className="relative p-8 rounded-2xl bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl max-w-md w-full text-center">

                        {/* Ambient Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Visualizer Encountered an Error
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    The data explorer crashed due to an unexpected state. This usually happens during complex data transitions.
                                </p>
                                {this.state.error && (
                                    <p className="text-xs font-mono text-red-400 bg-red-950/30 p-2 rounded mt-2 break-all">
                                        {this.state.error.message}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg hover:shadow-indigo-500/25 mt-4"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reload Visualizer
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
