async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).error || "Request failed");
  return res.json();
}

export const api = {
  getTasks: () => request("/api/tasks"),
  addTask: (data) => request("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: "DELETE" }),
  clearDone: (bucket) => request(`/api/tasks?bucket=${bucket}`, { method: "DELETE" }),

  getPractice: () => request("/api/practice"),
  addPractice: (data) => request("/api/practice", { method: "POST", body: JSON.stringify(data) }),
  deletePractice: (id) => request(`/api/practice/${id}`, { method: "DELETE" }),
};
