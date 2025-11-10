import { useState, useEffect } from "react";
import type { Entry, Mood } from "../types";
import { getEntries, deleteEntry } from "../storage";

// Mood color mapping
const MOOD_COLORS: Record<Mood, string> = {
  Happy: "#fbbf24", // yellow
  Calm: "#60a5fa", // blue
  Stressed: "#f87171", // red
  Tired: "#a78bfa", // purple
  Excited: "#fb923c", // orange
  Neutral: "#94a3b8", // gray
};

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
    if (confirm("Remove this reflection?")) {
      deleteEntry(id);
      setEntries(getEntries().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  };

  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // For older entries, show date and time
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <h2>Your reflections</h2>
        <p className="empty-state">Start tracking how you feel. Add your first entry above!</p>
      </div>
    );
  }

  return (
    <div className="entry-list">
      <h2>Your reflections ({entries.length})</h2>
      <div className="entries-container">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="entry-card"
            style={{
              borderLeftColor: MOOD_COLORS[entry.mood],
            }}
          >
            <div className="entry-details">
              <div className="entry-activity-heading">
                <span>{entry.activity}</span>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(entry.id)}
                  aria-label="Delete entry"
                >
                  ×
                </button>
              </div>
              <div className="entry-timestamp">{formatTimestamp(entry.timestamp)}</div>
              
              <div className="entry-field-row">
                <div className="entry-field">
                  <span className="field-label">Mood</span>
                  <span
                    className="field-value mood"
                    style={{
                      color: MOOD_COLORS[entry.mood],
                    }}
                  >
                    {entry.mood}
                  </span>
                </div>
                {entry.flow && (
                  <div className="flow-badge-container">
                    <span className="flow-badge">In flow</span>
                  </div>
                )}
              </div>
              
              <div className="entry-field bar-field">
                <span className="field-label">Energy</span>
                <div className="energy-bar-container">
                  <div className="energy-bar-track">
                    <div
                      className={`energy-bar ${entry.energy < 0 ? "negative" : "positive"}`}
                      style={{
                        width: `${Math.abs(entry.energy) * 50}%`,
                        marginLeft: entry.energy < 0 ? `${50 - Math.abs(entry.energy) * 50}%` : "50%",
                      }}
                    />
                  </div>
                  <span className="bar-value">{entry.energy.toFixed(2)}</span>
                </div>
                <div className="bar-labels">
                  <span>Negative</span>
                  <span>Positive</span>
                </div>
              </div>

              <div className="entry-field bar-field">
                <span className="field-label">Engagement</span>
                <div className="engagement-bar-container">
                  <div className="engagement-bar-track">
                    <div
                      className="engagement-bar"
                      style={{
                        width: `${entry.engagement * 100}%`,
                      }}
                    />
                  </div>
                  <span className="bar-value">{entry.engagement.toFixed(2)}</span>
                </div>
                <div className="bar-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {entry.notes && (
                <div className="entry-field notes">
                  <span className="field-label">Notes</span>
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

