import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const todayKey = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

const prettyDay = (key) => {
  if (key === todayKey()) return "Today";
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

/* ---------------- Task list (used for Today and Tomorrow) ---------------- */
function TaskList({ title, bucket, tasks, onChange, tone }) {
  const [text, setText] = useState("");
  const items = tasks.filter((t) => t.bucket === bucket);
  const doneCount = items.filter((t) => t.done).length;

  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const created = await api.addTask({ text, bucket });
    onChange((prev) => [...prev, created]);
    setText("");
  };

  const toggle = async (t) => {
    const updated = await api.updateTask(t._id, { done: !t.done });
    onChange((prev) => prev.map((x) => (x._id === t._id ? updated : x)));
  };

  const move = async (t) => {
    const updated = await api.updateTask(t._id, { bucket: "today", done: false });
    onChange((prev) => prev.map((x) => (x._id === t._id ? updated : x)));
  };

  const remove = async (t) => {
    await api.deleteTask(t._id);
    onChange((prev) => prev.filter((x) => x._id !== t._id));
  };

  const clearDone = async () => {
    await api.clearDone(bucket);
    onChange((prev) => prev.filter((x) => !(x.bucket === bucket && x.done)));
  };

  return (
    <section className={`panel ${tone}`}>
      <header className="panel-head">
        <h2>{title}</h2>
        <span className="count">
          {bucket === "today" ? `${doneCount}/${items.length} done` : `${items.length} planned`}
        </span>
      </header>

      <form className="row" onSubmit={add}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={bucket === "today" ? "What are you doing today?" : "What needs doing tomorrow?"}
        />
        <button className="btn">Add task</button>
      </form>

      {items.length === 0 && (
        <p className="empty">
          {bucket === "today" ? "Nothing yet. Add your first task for today." : "No plans for tomorrow yet."}
        </p>
      )}

      <ul className="tasks">
        {items.map((t) => (
          <li key={t._id} className={t.done ? "done" : ""}>
            {bucket === "today" ? (
              <label>
                <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
                <span>{t.text}</span>
              </label>
            ) : (
              <span className="plain">{t.text}</span>
            )}
            <div className="actions">
              {bucket === "tomorrow" && (
                <button className="link" onClick={() => move(t)}>Move to today</button>
              )}
              <button className="link danger" onClick={() => remove(t)} aria-label={`Delete ${t.text}`}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {bucket === "today" && doneCount > 0 && (
        <button className="link clear" onClick={clearDone}>Clear finished tasks</button>
      )}
    </section>
  );
}

/* ---------------- Practice log ---------------- */
function PracticeLog({ entries, setEntries }) {
  const empty = { question: "", topic: "", difficulty: "Medium", link: "", notes: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) return;
    const created = await api.addPractice({ ...form, day: todayKey() });
    setEntries((prev) => [created, ...prev]);
    setForm(empty);
  };

  const remove = async (id) => {
    await api.deletePractice(id);
    setEntries((prev) => prev.filter((x) => x._id !== id));
  };

  const grouped = useMemo(() => {
    const map = {};
    entries.forEach((p) => (map[p.day] ||= []).push(p));
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  return (
    <section className="panel practice">
      <header className="panel-head">
        <h2>Questions I practised</h2>
        <span className="count">{entries.length} total</span>
      </header>

      <form className="practice-form" onSubmit={add}>
        <input placeholder="Question or problem name" value={form.question} onChange={set("question")} />
        <div className="row">
          <input placeholder="Topic (e.g. Arrays, SQL)" value={form.topic} onChange={set("topic")} />
          <select value={form.difficulty} onChange={set("difficulty")}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <input placeholder="Link (optional)" value={form.link} onChange={set("link")} />
        <textarea placeholder="What did you learn? (optional)" rows={2} value={form.notes} onChange={set("notes")} />
        <button className="btn">Save question</button>
      </form>

      {entries.length === 0 && <p className="empty">No questions logged yet. Add the first one you solved.</p>}

      {grouped.map(([day, list]) => (
        <div key={day} className="day-group">
          <h3>
            {prettyDay(day)} <small>{list.length} solved</small>
          </h3>
          <ul className="questions">
            {list.map((p) => (
              <li key={p._id}>
                <div className="q-main">
                  <span className={`pill ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                  {p.link ? (
                    <a href={p.link} target="_blank" rel="noreferrer">{p.question}</a>
                  ) : (
                    <strong>{p.question}</strong>
                  )}
                  {p.topic && <em>{p.topic}</em>}
                </div>
                {p.notes && <p className="notes">{p.notes}</p>}
                <button className="link danger" onClick={() => remove(p._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [practice, setPractice] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTasks(), api.getPractice()])
      .then(([t, p]) => {
        setTasks(t);
        setPractice(p);
      })
      .catch(() => setError("Could not reach the server. Check that it is running and MONGO_URI is set in server/.env."))
      .finally(() => setLoading(false));
  }, []);

  const solvedToday = practice.filter((p) => p.day === todayKey()).length;
  const dateText = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <main className="page">
      <header className="top">
        <div>
          <p className="date">{dateText}</p>
          <h1>My Daily Dashboard</h1>
        </div>
        <div className="solved">
          <strong>{solvedToday}</strong>
          <span>questions practised today</span>
        </div>
      </header>

      {error && <div className="error">{error}</div>}
      {loading && !error && <p className="empty">Loading your dashboard…</p>}

      {!loading && !error && (
        <div className="grid">
          <div className="col">
            <TaskList title="Today's tasks" bucket="today" tone="today" tasks={tasks} onChange={setTasks} />
            <TaskList title="For tomorrow" bucket="tomorrow" tone="tomorrow" tasks={tasks} onChange={setTasks} />
          </div>
          <PracticeLog entries={practice} setEntries={setPractice} />
        </div>
      )}
    </main>
  );
}
