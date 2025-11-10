import { useState } from "react";
import { EntryForm } from "./components/EntryForm";
import { EntryList } from "./components/EntryList";
import { MetricsPage } from "./components/MetricsPage";

type Page = "entries" | "metrics";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("entries");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowForm(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  if (currentPage === "metrics") {
    return (
      <div className="app">
        <MetricsPage onBack={() => setCurrentPage("entries")} />
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Reflectr</h1>
        <p className="subtitle">How are you feeling right now?</p>
      </header>
      <main className="main-layout">
        <EntryList refreshTrigger={refreshTrigger} />
      </main>
      
      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setShowForm(true)}
        aria-label="Add new entry"
      >
        <span className="fab-icon">+</span>
      </button>

      {/* Navigation Button to Metrics */}
      <button
        className="nav-button nav-button-metrics"
        onClick={() => setCurrentPage("metrics")}
        aria-label="View metrics"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      </button>

      {/* Modal Overlay */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseForm} aria-label="Close">
              ×
            </button>
            <EntryForm onSave={handleSave} onClose={handleCloseForm} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

