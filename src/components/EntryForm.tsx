import { useState, useEffect } from "react";
import type { Mood } from "../types";
import { addEntry } from "../storage";
import { ActivitySelect } from "./ActivitySelect";

interface EntryFormProps {
  onSave: () => void;
  onClose?: () => void;
}

const MOODS: Mood[] = ["Happy", "Calm", "Stressed", "Tired", "Excited", "Neutral"];

// Mood color mapping (matching EntryList)
const MOOD_COLORS: Record<Mood, string> = {
  Happy: "#fbbf24", // yellow
  Calm: "#60a5fa", // blue
  Stressed: "#f87171", // red
  Tired: "#a78bfa", // purple
  Excited: "#fb923c", // orange
  Neutral: "#94a3b8", // gray
};

// Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper to convert datetime-local string to ISO string
function datetimeLocalToISO(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

export function EntryForm({ onSave, onClose }: EntryFormProps) {
  const now = new Date();
  const [mood, setMood] = useState<Mood>("Neutral");
  const [energy, setEnergy] = useState<number>(0);
  const [engagement, setEngagement] = useState<number>(0.5);
  const [flow, setFlow] = useState<boolean>(false);
  const [activity, setActivity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>(formatDateTimeLocal(now));
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    // Check if form is valid (mood always has a value, so just check activity)
    setIsValid(activity.trim() !== "");
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const timestampISO = datetimeLocalToISO(timestamp);

    addEntry({
      mood,
      energy,
      engagement,
      flow,
      activity: activity.trim(),
      notes: notes.trim() || undefined,
      timestamp: timestampISO,
    });

    // Reset form
    const newNow = new Date();
    setMood("Neutral");
    setEnergy(0);
    setEngagement(0.5);
    setFlow(false);
    setActivity("");
    setNotes("");
    setTimestamp(formatDateTimeLocal(newNow));

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="entry-form">
      <h2>How are you feeling?</h2>

      <div className="form-group">
        <label htmlFor="activity">What are you doing?</label>
        <ActivitySelect value={activity} onChange={setActivity} />
      </div>

      <div className="form-group">
        <label htmlFor="timestamp">When?</label>
        <input
          id="timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="mood">Mood</label>
        <div className="mood-select-wrapper">
          <select
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value as Mood)}
            required
            className="mood-select"
            style={{
              borderLeftColor: MOOD_COLORS[mood],
            }}
          >
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <div className="mood-color-indicator" style={{ backgroundColor: MOOD_COLORS[mood] }} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="energy">
          Energy: <span className="value-badge">{energy.toFixed(2)}</span>
        </label>
        <div className="slider-wrapper">
          <div className="slider-tail energy-tail">
            <div
              className="slider-tail-bar"
              style={{
                width: `${Math.abs(energy) * 50}%`,
                marginLeft: energy < 0 ? `${50 - Math.abs(energy) * 50}%` : "50%",
                backgroundColor: energy < 0 ? "#f87171" : "#10b981",
              }}
            />
          </div>
          <input
            id="energy"
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={energy}
            onChange={(e) => setEnergy(parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>
        <div className="slider-labels">
          <span>Negative</span>
          <span>0</span>
          <span>Positive</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="engagement">
          Engagement: <span className="value-badge">{engagement.toFixed(2)}</span>
        </label>
        <div className="slider-wrapper">
          <div className="slider-tail engagement-tail">
            <div
              className="slider-tail-bar"
              style={{
                width: `${engagement * 100}%`,
                backgroundColor: "#6366f1",
              }}
            />
          </div>
          <input
            id="engagement"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={engagement}
            onChange={(e) => setEngagement(parseFloat(e.target.value))}
            className="slider-input"
          />
        </div>
        <div className="slider-labels">
          <span>Low</span>
          <span>0.5</span>
          <span>High</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="flow">
          <input
            id="flow"
            type="checkbox"
            checked={flow}
            onChange={(e) => setFlow(e.target.checked)}
          />
          In the flow
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Anything else on your mind?"
        />
      </div>

      <div className="form-actions">
        {onClose && (
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
        )}
        <button type="submit" disabled={!isValid} className="save-button">
          Save
        </button>
      </div>
    </form>
  );
}

