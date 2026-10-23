
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    className: "",
    rfidUid: "",
  });
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registering, setRegistering] = useState(false);

  async function loadDashboard() {
    try {
      const [studentResponse, attendanceResponse] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/attendance`),
      ]);

      setStudents(studentResponse.data.students || []);
      setAttendance(attendanceResponse.data.attendance || []);
      setError("");
    } catch (err) {
      setError("Unable to load data. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterStudent(e) {
    e.preventDefault();

    setRegistering(true);
    setRegisterMessage("");
    setRegisterError("");

    try {
      const response = await axios.post(`${API}/students`, formData);

      setRegisterMessage(response.data.message || "Student registered successfully!");

      setFormData({
        name: "",
        rollNumber: "",
        className: "",
        rfidUid: "",
      });

      await loadDashboard();
    } catch (err) {
      setRegisterError(
        err.response?.data?.message || "Failed to register student."
      );
    } finally {
      setRegistering(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const todaysAttendance = attendance.filter((record) => record.date === today);
  const activeStudents = students.filter((student) => student.isActive);
  const present = todaysAttendance.length;
  const absent = Math.max(activeStudents.length - present, 0);
  const attendanceRate = activeStudents.length
    ? Math.round((present / activeStudents.length) * 100)
    : 0;

  const chartData = [
    { name: "Present", count: present },
    { name: "Absent", count: absent },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <i className="bi bi-broadcast-pin" />
          </div>
          <div>
            <h5>Attend<span>IQ</span></h5>
            <small>SMART ATTENDANCE</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <button className="nav-item active">
          <i className="bi bi-grid-1x2-fill" /> Overview
        </button>
        <button className="nav-item" onClick={() => document.getElementById("students")?.scrollIntoView({ behavior: "smooth" })}>
          <i className="bi bi-people" /> Students
        </button>
        <button className="nav-item" onClick={() => document.getElementById("attendance")?.scrollIntoView({ behavior: "smooth" })}>
          <i className="bi bi-calendar-check" /> Attendance
        </button>

        <div className="sidebar-bottom">
          <div className="device-card">
            <span className="device-dot" />
            <div>
              <strong>RFID Reader</strong>
              <small>Hardware integration pending</small>
            </div>
          </div>
          <small className="sidebar-footer">RFID SYSTEM · v1.0</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb-text">Workspace / Overview</div>
            <h2>Dashboard</h2>
          </div>
          <div className="topbar-actions">
            <button
              className="refresh-button"
              onClick={() => {
                setShowRegister(!showRegister);
                setRegisterMessage("");
                setRegisterError("");
              }}
            >
              <i className="bi bi-person-plus" /> Register Student
            </button>
            <span className="system-status">
              <span className="device-dot" /> System online
            </span>
            <button className="icon-button" onClick={loadDashboard} title="Refresh data">
              <i className="bi bi-arrow-clockwise" />
            </button>
            <div className="avatar">A</div>
          </div>
        </header>

        {error && <div className="alert alert-warning">{error}</div>}
        
        
        {showRegister && (
          <section className="panel register-panel">
            <div className="panel-heading">
              <div>
                <h5>Register a student</h5>
                <p>Add a student to the attendance system</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowRegister(false)}
                type="button"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {registerMessage && (
              <div className="alert alert-success">{registerMessage}</div>
            )}

            {registerError && (
              <div className="alert alert-danger">{registerError}</div>
            )}

            <form onSubmit={handleRegisterStudent}>
              <div className="register-grid">
                <div>
                  <label htmlFor="studentName">Full name *</label>
                  <input
                    id="studentName"
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div>
                  <label htmlFor="rollNumber">Roll number *</label>
                  <input
                    id="rollNumber"
                    className="form-control"
                    required
                    value={formData.rollNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, rollNumber: e.target.value })
                    }
                    placeholder="e.g. 101"
                  />
                </div>

                <div>
                  <label htmlFor="className">Class *</label>
                  <input
                    id="className"
                    className="form-control"
                    required
                    value={formData.className}
                    onChange={(e) =>
                      setFormData({ ...formData, className: e.target.value })
                    }
                    placeholder="e.g. TY-CSE"
                  />
                </div>

                <div>
                  <label htmlFor="rfidUid">RFID UID (optional)</label>
                  <input
                    id="rfidUid"
                    className="form-control"
                    value={formData.rfidUid}
                    onChange={(e) =>
                      setFormData({ ...formData, rfidUid: e.target.value })
                    }
                    placeholder="e.g. A3:7F:21:9B"
                  />
                </div>
              </div>

              <div className="register-actions">
                <button
                  type="button"
                  className="refresh-button"
                  onClick={() =>
                    setFormData({
                      name: "",
                      rollNumber: "",
                      className: "",
                      rfidUid: "",
                    })
                  }
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={registering}
                >
                  {registering ? "Registering..." : "Register Student"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="welcome-row">
          <div>
            <h3>Good to see you 👋</h3>
            <p>Here's what's happening with attendance today.</p>
          </div>
          <button className="refresh-button" onClick={loadDashboard}>
            <i className="bi bi-arrow-repeat" /> Refresh data
          </button>
        </section>

        {loading ? (
          <div className="loading-panel">Loading attendance data...</div>
        ) : (
          <>
            <section className="stats-grid">
              <StatCard icon="bi-people" label="Total students" value={activeStudents.length} color="purple" detail="Active registrations" />
              <StatCard icon="bi-person-check" label="Present today" value={present} color="green" detail="Unique students marked" />
              <StatCard icon="bi-person-x" label="Absent today" value={absent} color="orange" detail="Not yet marked present" />
              <StatCard icon="bi-graph-up-arrow" label="Attendance rate" value={`${attendanceRate}%`} color="blue" detail="Today's participation" />
            </section>

            <section className="content-grid">
              <div className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h5>Attendance overview</h5>
                    <p>Present vs absent · Today</p>
                  </div>
                  <span className="mini-tag">TODAY</span>
                </div>
                <div className="chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#8790a5" />
                      <Tooltip
                        contentStyle={{
                          background: "#171b29",
                          border: "1px solid #30374b",
                          borderRadius: 10,
                          color: "#fff",
                        }}
                        cursor={{ fill: "rgba(140,120,255,0.08)" }}
                      />
                      <Bar dataKey="count" fill="#8b7aff" radius={[7, 7, 0, 0]} barSize={65} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h5>System status</h5>
                    <p>Connected services</p>
                  </div>
                  <i className="bi bi-activity panel-icon" />
                </div>
                <div className="service-row">
                  <div className="service-icon purple-bg"><i className="bi bi-server" /></div>
                  <div className="service-info"><strong>Backend API</strong><small>Attendance service</small></div>
                  <span className="status-pill">Connected</span>
                </div>
                <div className="service-row">
                  <div className="service-icon green-bg"><i className="bi bi-database" /></div>
                  <div className="service-info"><strong>MongoDB</strong><small>Database service</small></div>
                  <span className="status-pill">Connected</span>
                </div>
                <div className="service-row">
                  <div className="service-icon orange-bg"><i className="bi bi-broadcast" /></div>
                  <div className="service-info"><strong>ESP32 + RFID</strong><small>Physical device</small></div>
                  <span className="pending-pill">Coming soon</span>
                </div>
              </div>
            </section>

            <section className="panel table-panel" id="attendance">
              <div className="panel-heading">
                <div>
                  <h5>Recent attendance</h5>
                  <p>Latest records from your database</p>
                </div>
                <span className="record-count">{attendance.length} records</span>
              </div>

              <div className="table-responsive">
                <table className="table attendance-table align-middle">
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>ROLL NUMBER</th>
                      <th>CLASS</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.slice(0, 10).map((record) => (
                      <tr key={record._id}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {(record.student?.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <strong>{record.student?.name || "Unknown student"}</strong>
                          </div>
                        </td>
                        <td>{record.student?.rollNumber || "—"}</td>
                        <td>{record.student?.className || "—"}</td>
                        <td>{record.date}</td>
                        <td><span className="attendance-pill">Present</span></td>
                      </tr>
                    ))}
                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          No attendance records yet. Scan a registered RFID card to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel table-panel" id="students">
              <div className="panel-heading">
                <div>
                  <h5>Registered students</h5>
                  <p>Students enrolled in the system</p>
                </div>
                <span className="record-count">{students.length} students</span>
              </div>
              <div className="table-responsive">
                <table className="table attendance-table align-middle">
                  <thead>
                    <tr><th>STUDENT</th><th>ROLL NUMBER</th><th>CLASS</th><th>RFID UID</th><th>STATUS</th></tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td><div className="student-cell"><div className="student-avatar">{student.name.charAt(0).toUpperCase()}</div><strong>{student.name}</strong></div></td>
                        <td>{student.rollNumber}</td>
                        <td>{student.className}</td>
                        <td><code>{student.rfidUid || "Unassigned"}</code></td>
                        <td><span className="attendance-pill">{student.isActive ? "Active" : "Inactive"}</span></td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan="5" className="empty-state">No students registered yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <footer className="page-footer">AttendIQ · RFID Smart Attendance System</footer>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color, detail }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><i className={`bi ${icon}`} /></div>
      <p>{label}</p>
      <h3>{value}</h3>
      <small>{detail}</small>
    </div>
  );
}

export default App;
