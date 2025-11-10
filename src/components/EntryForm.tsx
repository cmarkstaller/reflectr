import { useState, useEffect } from "react";
import type { Mood } from "../types";
import { addEntry } from "../storage";
import { ActivitySelect } from "./ActivitySelect";

interface EntryFormProps {
  onSave: () => void;
}

const MOODS: Mood[] = ["Happy", "Calm", "Stressed", "Tired", "Excited", "Neutral"];

export function EntryForm({ onSave }: EntryFormProps) {
  const [mood, setMood] = useState<Mood>("Neutral");
  const [energy, setEnergy] = useState<number>(0);
  const [engagement, setEngagement] = useState<number>(0.5);
  const [flow, setFlow] = useState<boolean>(false);
  const [activity, setActivity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    // Check if form is valid (mood always has a value, so just check activity)
    setIsValid(activity.trim() !== "");
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    addEntry({
      mood,
      energy,
      engagement,
      flow,
      activity: activity.trim(),
      notes: notes.trim() || undefined,
    });

    // Reset form
    setMood("Neutral");
    setEnergy(0);
    setEngagement(0.5);
    setFlow(false);
    setActivity("");
    setNotes("");

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="entry-form">
      <h2>New Entry</h2>

      <div className="form-group">
        <label htmlFor="mood">Mood *</label>
        <select
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value as Mood)}
          required
        >
          {MOODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="energy">
          Energy: <span className="value-badge">{energy.toFixed(2)}</span>
        </label>
        <input
          id="energy"
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={energy}
          onChange={(e) => setEnergy(parseFloat(e.target.value))}
        />
        <div className="slider-labels">
          <span>-1</span>
          <span>0</span>
          <span>1</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="engagement">
          Engagement: <span className="value-badge">{engagement.toFixed(2)}</span>
        </label>
        <input
          id="engagement"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={engagement}
          onChange={(e) => setEngagement(parseFloat(e.target.value))}
        />
        <div className="slider-labels">
          <span>0</span>
          <span>0.5</span>
          <span>1</span>
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
          Flow
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="activity">Activity *</label>
        <ActivitySelect value={activity} onChange={setActivity} />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add any additional notes..."
        />
      </div>

      <button type="submit" disabled={!isValid} className="save-button">
        Save Entry
      </button>
    </form>
  );
}

