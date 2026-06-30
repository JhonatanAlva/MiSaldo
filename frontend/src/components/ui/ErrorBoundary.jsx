import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <span className="text-5xl">⚠️</span>
          <p className="font-semibold text-base">
            {this.props.titulo || "Algo salió mal"}
          </p>
          <p className="text-sm text-gray-400">
            {this.props.descripcion || "Esta sección no pudo cargarse. Intenta recargar la página."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#00c57a]/10 text-[#00c57a] hover:bg-[#00c57a]/20 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
