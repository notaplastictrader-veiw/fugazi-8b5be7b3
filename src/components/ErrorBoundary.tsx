import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { reportClientError } from "@/lib/errorReporter";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError({
      message: error.message,
      stack: `${error.stack ?? ""}\n--component--\n${info.componentStack ?? ""}`,
      severity: "error",
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, message: undefined });
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl uppercase text-foreground mb-2">Something broke</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We've logged the issue. Try reloading — if it keeps happening, let us know.
          </p>
          {this.state.message && (
            <pre className="text-xs text-muted-foreground bg-muted/30 rounded p-3 mb-6 text-left overflow-auto max-h-32">
              {this.state.message}
            </pre>
          )}
          <Button onClick={this.handleReset} className="w-full">Reload</Button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
