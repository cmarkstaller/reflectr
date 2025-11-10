import { useState } from "react";
import { EntryForm } from "./components/EntryForm";
import { EntryList } from "./components/EntryList";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowForm(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

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

