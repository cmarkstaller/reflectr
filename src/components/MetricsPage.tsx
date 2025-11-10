import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { Mood } from "../types";
import { getEntries } from "../storage";

const MOOD_COLORS: Record<Mood, string> = {
  Happy: "#fbbf24", // yellow
  Calm: "#60a5fa", // blue
  Stressed: "#f87171", // red
  Tired: "#a78bfa", // purple
  Excited: "#fb923c", // orange
  Neutral: "#94a3b8", // gray
};

interface MetricsPageProps {
  onBack: () => void;
}

export function MetricsPage({ onBack }: MetricsPageProps) {
  const entries = useMemo(() => getEntries(), []);

  // Function to map energy value (-1 to 1) to a color on red-to-green gradient with transparent middle
  const getEnergyColor = (energy: number): string => {
    // Clamp energy to [-1, 1]
    const clamped = Math.max(-1, Math.min(1, energy));
    
    // Calculate opacity based on distance from zero (0 = transparent, 1 = fully opaque at extremes)
    const opacity = Math.abs(clamped);
    
    // Deep red: rgb(127, 29, 29) = #7f1d1d
    // Deep green: rgb(5, 95, 70) = #055f46
    
    if (clamped < 0) {
      // Negative energy: deep red with opacity based on magnitude
      return `rgba(127, 29, 29, ${opacity})`;
    } else if (clamped > 0) {
      // Positive energy: deep green with opacity based on magnitude
      return `rgba(5, 95, 70, ${opacity})`;
    } else {
      // Zero energy: fully transparent
      return "transparent";
    }
  };

  // 1. Flow Map Data (Energy vs Engagement Scatter Plot)
  const flowMapData = useMemo(() => {
    return entries.map((entry) => ({
      x: entry.engagement,
      y: entry.energy,
      mood: entry.mood,
      flow: entry.flow,
      id: entry.id,
    }));
  }, [entries]);

  // 2. Trends Over Time Data (last 30 days)
  const trendsData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const filtered = entries.filter(
      (e) => new Date(e.timestamp) >= thirtyDaysAgo
    );
    
    // Group by date (day)
    const byDate = new Map<string, { energy: number[]; engagement: number[]; flow: number }>();
    
    filtered.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toISOString().split("T")[0];
      
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, { energy: [], engagement: [], flow: 0 });
      }
      
      const dayData = byDate.get(dateKey)!;
      dayData.energy.push(entry.energy);
      dayData.engagement.push(entry.engagement);
      if (entry.flow) dayData.flow++;
    });
    
    // Convert to array and calculate averages
    return Array.from(byDate.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        energy: data.energy.reduce((a, b) => a + b, 0) / data.energy.length,
        engagement: data.engagement.reduce((a, b) => a + b, 0) / data.engagement.length,
        flow: data.flow,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries]);

  // 3. By Activity Data
  const activityData = useMemo(() => {
    const byActivity = new Map<
      string,
      { energy: number[]; engagement: number[] }
    >();

    entries.forEach((entry) => {
      if (!byActivity.has(entry.activity)) {
        byActivity.set(entry.activity, { energy: [], engagement: [] });
      }
      const activityData = byActivity.get(entry.activity)!;
      activityData.energy.push(entry.energy);
      activityData.engagement.push(entry.engagement);
    });

    return Array.from(byActivity.entries())
      .map(([activity, data]) => ({
        activity,
        avgEnergy: data.energy.reduce((a, b) => a + b, 0) / data.energy.length,
        avgEngagement: data.engagement.reduce((a, b) => a + b, 0) / data.engagement.length,
      }))
      .sort((a, b) => b.avgEnergy - a.avgEnergy);
  }, [entries]);

  // 4. Mood Mix Data
  const moodData = useMemo(() => {
    const moodCounts = new Map<Mood, number>();
    
    entries.forEach((entry) => {
      moodCounts.set(entry.mood, (moodCounts.get(entry.mood) || 0) + 1);
    });

    return Array.from(moodCounts.entries()).map(([mood, count]) => ({
      name: mood,
      value: count,
      color: MOOD_COLORS[mood],
    }));
  }, [entries]);

  // 5. Time-of-Day Heatmap Data
  const heatmapData = useMemo(() => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const timeSlots = ["Morning", "Afternoon", "Evening", "Night"];
    
    const heatmap = new Map<string, { energy: number[]; engagement: number[] }>();

    entries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dayOfWeek = daysOfWeek[date.getDay()];
      const hour = date.getHours();
      
      let timeSlot: string;
      if (hour >= 5 && hour < 12) timeSlot = "Morning";
      else if (hour >= 12 && hour < 17) timeSlot = "Afternoon";
      else if (hour >= 17 && hour < 21) timeSlot = "Evening";
      else timeSlot = "Night";

      const key = `${dayOfWeek}-${timeSlot}`;
      if (!heatmap.has(key)) {
        heatmap.set(key, { energy: [], engagement: [] });
      }
      const slotData = heatmap.get(key)!;
      slotData.energy.push(entry.energy);
      slotData.engagement.push(entry.engagement);
    });

    // Create grid data
    const gridData: Array<{ day: string; time: string; energy: number; engagement: number }> = [];
    
    daysOfWeek.forEach((day) => {
      timeSlots.forEach((time) => {
        const key = `${day}-${time}`;
        const data = heatmap.get(key);
        if (data && data.energy.length > 0) {
          gridData.push({
            day,
            time,
            energy: data.energy.reduce((a, b) => a + b, 0) / data.energy.length,
            engagement: data.engagement.reduce((a, b) => a + b, 0) / data.engagement.length,
          });
        } else {
          gridData.push({
            day,
            time,
            energy: 0,
            engagement: 0,
          });
        }
      });
    });

    return gridData;
  }, [entries]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          {data?.mood && (
            <p style={{ color: MOOD_COLORS[data.mood as Mood], fontWeight: 600 }}>
              {data.mood}
            </p>
          )}
          {data?.flow && <p style={{ color: "#10b981" }}>✨ In Flow</p>}
          {data?.x !== undefined && (
            <p>Engagement: {data.x.toFixed(2)}</p>
          )}
          {data?.y !== undefined && (
            <p>Energy: {data.y.toFixed(2)}</p>
          )}
          {payload.map((entry: any, index: number) => {
            if (entry.name && entry.value !== undefined) {
              return (
                <p key={index} style={{ color: entry.color }}>
                  {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="metrics-page">
        <header>
          <h1>Metrics</h1>
        </header>
        <main className="main-layout">
          <div className="empty-state">
            <p>No data yet. Add some entries to see your metrics!</p>
          </div>
        </main>
        <button className="nav-button" onClick={onBack} aria-label="Back to entries">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="metrics-page">
      <header>
        <h1>Metrics</h1>
      </header>
      <main className="metrics-layout">
        {/* 1. Flow Map */}
        <div className="chart-card">
          <h2>Flow Map</h2>
          <p className="chart-description">Energy vs. Engagement</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 5, right: 5, bottom: 20, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Engagement"
                domain={[0, 1]}
                label={{ value: "Engagement (Low → High)", position: "insideBottom", offset: -2, style: { fontSize: "11px" } }}
                tick={{ fontSize: 13 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Energy"
                domain={[-1, 1]}
                label={{ value: "Energy (Negative → Positive)", angle: -90, position: "left", style: { fontSize: "11px", textAnchor: "middle" } }}
                tick={{ fontSize: 13 }}
              />
              <Tooltip content={<CustomTooltip />} />
              {Object.keys(MOOD_COLORS).map((mood) => {
                const moodData = flowMapData.filter((d) => d.mood === mood && !d.flow);
                const flowData = flowMapData.filter((d) => d.mood === mood && d.flow);
                return (
                  <g key={mood}>
                    <Scatter
                      data={moodData}
                      fill={MOOD_COLORS[mood as Mood]}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        return <circle cx={cx} cy={cy} r={4} fill={MOOD_COLORS[mood as Mood]} />;
                      }}
                    />
                    <Scatter
                      data={flowData}
                      fill={MOOD_COLORS[mood as Mood]}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={8}
                              fill={MOOD_COLORS[mood as Mood]}
                              opacity={0.4}
                              filter="url(#glow)"
                            />
                            <circle cx={cx} cy={cy} r={5} fill={MOOD_COLORS[mood as Mood]} />
                          </g>
                        );
                      }}
                    />
                  </g>
                );
              })}
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="legend-section">
              <span className="legend-label">Moods:</span>
              {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                <span key={mood} className="mood-legend-item">
                  <span className="mood-color-dot" style={{ backgroundColor: color }}></span>
                  {mood}
                </span>
              ))}
            </div>
            <div className="legend-section">
              <span>Regular entries</span>
              <span className="flow-legend">Flow entries (highlighted)</span>
            </div>
          </div>
        </div>

        {/* 2. Trends Over Time */}
        <div className="chart-card">
          <h2>Trends Over Time</h2>
          <p className="chart-description">Last 30 days</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-1, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#10b981"
                strokeWidth={2}
                name="Energy"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#6366f1"
                strokeWidth={2}
                name="Engagement"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3. By Activity - Energy */}
        <div className="chart-card">
          <h2>Energy by Activity</h2>
          <p className="chart-description">Average Energy per Activity</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activity" />
              <YAxis domain={[-1, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="energyPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="energyNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
              <Bar
                dataKey="avgEnergy"
                name="Energy"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const value = payload.avgEnergy;
                  const fill = value >= 0 ? "url(#energyPositive)" : "url(#energyNegative)";
                  return <rect x={x} y={y} width={width} height={height} fill={fill} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4. By Activity - Engagement */}
        <div className="chart-card">
          <h2>Engagement by Activity</h2>
          <p className="chart-description">Average Engagement per Activity</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activity" />
              <YAxis domain={[0, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <Bar
                dataKey="avgEngagement"
                name="Engagement"
                fill="url(#engagementGradient)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5. Mood Mix */}
        <div className="chart-card">
          <h2>Mood Mix</h2>
          <p className="chart-description">Distribution of moods</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percent } = props;
                  return `${name} ${((percent as number) * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Time-of-Day Heatmap */}
        <div className="chart-card">
          <h2>When You Feel Best</h2>
          <p className="chart-description">Average Energy by Time and Day</p>
          <div className="heatmap-container">
            <table className="heatmap">
              <thead>
                <tr>
                  <th></th>
                  <th>Morning</th>
                  <th>Afternoon</th>
                  <th>Evening</th>
                  <th>Night</th>
                </tr>
              </thead>
              <tbody>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <tr key={day}>
                    <td className="heatmap-day">{day}</td>
                    {["Morning", "Afternoon", "Evening", "Night"].map((time) => {
                      const cellData = heatmapData.find(
                        (d) => d.day === day && d.time === time
                      );
                      const energy = cellData?.energy || 0;
                      const backgroundColor = energy !== 0 ? getEnergyColor(energy) : "var(--border-light)";
                      // Determine text color based on energy value for contrast
                      const textColor = energy !== 0 
                        ? (energy > 0.3 || energy < -0.3 ? "white" : "var(--text)")
                        : "var(--text-light)";
                      return (
                        <td
                          key={time}
                          className="heatmap-cell"
                          style={{
                            backgroundColor,
                            color: textColor,
                          }}
                          title={`${day} ${time}: Energy ${energy.toFixed(2)}`}
                        >
                          {energy !== 0 ? energy.toFixed(1) : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <button className="nav-button" onClick={onBack} aria-label="Back to entries">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

