
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Use React.Component explicitly to ensure props and state are correctly inherited and typed
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    // Access state for error checking
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-fade-in">
                <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                
                <h1 className="text-2xl font-black text-white mb-2 font-orbitron uppercase tracking-widest text-red-500">
                    System Malfunction
                </h1>
                
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    A critical error has occurred in the neural link. The application has been halted to prevent data corruption.
                </p>

                <div className="bg-black/30 p-4 rounded-lg border border-gray-800 mb-6 text-left overflow-auto max-h-32 custom-scrollbar">
                     <code className="text-[10px] text-red-400 font-mono break-all block">
                        {this.state.error?.toString() || 'Unknown Error'}
                     </code>
                </div>

                <button 
                    onClick={this.handleReload}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-red-900/20 shadow-lg transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2 group transform active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Reboot System
                </button>
            </div>
        </div>
      );
    }

    // Directly return children from props to avoid destructing errors if props are not inferred correctly
    return this.props.children;
  }
}

export default ErrorBoundary;
