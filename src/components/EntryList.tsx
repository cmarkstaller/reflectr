import { useState, useEffect } from "react";
import type { Entry } from "../types";
import { getEntries, deleteEntry } from "../storage";

interface EntryListProps {
  refreshTrigger: number;
}

export function EntryList({ refreshTrigger }: EntryListProps) {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const loaded = getEntries();
    // Sort newest first
    loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setEntries(loaded);
  }, [refreshTrigger]);

  const handleDelete = (id: string) => {
    if (confirm("Delete this entry?")) {
      deleteEntry(id);
      setEntries(getEntries().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  };

  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <h2>Entries</h2>
        <p className="empty-state">No entries yet. Create your first entry!</p>
      </div>
    );
  }

  return (
    <div className="entry-list">
      <h2>Entries ({entries.length})</h2>
      <div className="entries-container">
        {entries.map((entry) => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header">
              <span className="entry-timestamp">{formatTimestamp(entry.timestamp)}</span>
              <button
                className="delete-button"
                onClick={() => handleDelete(entry.id)}
                aria-label="Delete entry"
              >
                ×
              </button>
            </div>
            <div className="entry-details">
              <div className="entry-field">
                <span className="field-label">Mood:</span>
                <span className="field-value mood">{entry.mood}</span>
              </div>
              <div className="entry-field">
                <span className="field-label">Activity:</span>
                <span className="field-value">{entry.activity}</span>
              </div>
              <div className="entry-field">
                <span className="field-label">Energy:</span>
                <span className="field-value">{entry.energy.toFixed(2)}</span>
              </div>
              <div className="entry-field">
                <span className="field-label">Engagement:</span>
                <span className="field-value">{entry.engagement.toFixed(2)}</span>
              </div>
              {entry.flow && (
                <div className="entry-field">
                  <span className="field-label">Flow:</span>
                  <span className="field-value">✓</span>
                </div>
              )}
              {entry.notes && (
                <div className="entry-field notes">
                  <span className="field-label">Notes:</span>
                  <span className="field-value">{entry.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

