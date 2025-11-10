import { useState } from "react";
import { EntryForm } from "./components/EntryForm";
import { EntryList } from "./components/EntryList";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      <header>
        <h1>Reflectr</h1>
        <p className="subtitle">Track your mood, energy, and activities</p>
      </header>
      <main className="main-layout">
        <div className="left-column">
          <EntryForm onSave={handleSave} />
        </div>
        <div className="right-column">
          <EntryList refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}

export default App;

