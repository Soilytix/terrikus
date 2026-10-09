import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";
import { App } from "./app/App";
import { SAVE_KEY } from "./save/schema";

const raw = () => {
  try {
    return localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
};

/** Last line of defence: a render crash offers the notebook back instead of a blank page. */
class Crash extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    if (!this.state.error) return this.props.children;
    const saved = raw();
    return (
      <main className="crash">
        <h1>Something broke</h1>
        <p>The book stopped on an error. Your notebook is still in this browser.</p>
        <p className="muted small mono">{this.state.error.message}</p>
        <div className="btn-row">
          {saved && (
            <a
              className="btn"
              download="pedologicus-notebook.json"
              href={URL.createObjectURL(new Blob([saved], { type: "application/json" }))}
            >
              Export notebook
            </a>
          )}
          <button
            type="button"
            className="btn"
            onClick={() => {
              try {
                localStorage.removeItem(SAVE_KEY);
              } catch {
                /* nothing stored */
              }
              location.hash = "";
              location.reload();
            }}
          >
            Reset notebook
          </button>
          <button type="button" className="btn btn-primary" onClick={() => location.reload()}>
            Reload
          </button>
        </div>
      </main>
    );
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("#root missing from index.html");
createRoot(root).render(
  <StrictMode>
    <Crash>
      <App />
    </Crash>
  </StrictMode>,
);
