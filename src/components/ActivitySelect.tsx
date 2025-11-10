import { useState, useEffect } from "react";
import { getActivities, addActivity } from "../storage";

interface ActivitySelectProps {
  value: string;
  onChange: (activity: string) => void;
}

export function ActivitySelect({ value, onChange }: ActivitySelectProps) {
  const [activities, setActivities] = useState<string[]>([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newActivity, setNewActivity] = useState("");
  const [selectValue, setSelectValue] = useState<string>(value || "");

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  useEffect(() => {
    setSelectValue(value || "");
  }, [value]);

  const handleAddActivity = () => {
    const trimmed = newActivity.trim();
    if (!trimmed) return;

    const added = addActivity(trimmed);
    setActivities(getActivities());
    onChange(added);
    setNewActivity("");
    setShowAddInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddActivity();
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "__add_new__") {
      setShowAddInput(true);
      // Reset select to previous value
      setSelectValue(value || "");
    } else {
      setSelectValue(selected);
      onChange(selected);
    }
  };

  return (
    <div className="activity-select">
      <select value={selectValue} onChange={handleSelectChange} required>
        <option value="">Select activity...</option>
        {activities.map((activity) => (
          <option key={activity} value={activity}>
            {activity}
          </option>
        ))}
        <option value="__add_new__">➕ Add new activity…</option>
      </select>
      {showAddInput && (
        <div className="add-activity-input">
          <input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter activity name"
            autoFocus
          />
          <button type="button" onClick={handleAddActivity}>
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddInput(false);
              setNewActivity("");
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

