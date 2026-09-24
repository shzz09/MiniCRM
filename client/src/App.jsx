import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  UserCheck,
  Clock3,
  XCircle,
  Plus,
  ArrowUpRight,
  CalendarDays,
  LogOut,
  LockKeyhole,
  Mail,
  Phone,
  Globe,
  FileText,
  Send,
  RefreshCw,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Menu,
  Target,
  Activity,
  ExternalLink,
  Sun,
  Moon,
  Zap,
  CheckCheck,
  Download,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  BellRing,
  Palette,
  Database,
  KeyRound,
  Save,
  MoreHorizontal,
  Filter,
  ChevronRight,
  BarChart3,
  PieChart,
  CalendarCheck2,
  Timer,
  CircleDollarSign,
  MousePointerClick,
  MessageSquare,
  PhoneCall,
  MailCheck,
} from "lucide-react";

import "./App.css";

const API_URL = "https://minicrm-backend-zvnt.onrender.com";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crm_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const emptyLead = {
  name: "",
  email: "",
  phone: "",
  source: "Website",
  status: "New",
  notes: "",
};

const statuses = ["New", "Contacted", "Converted", "Not Interested"];

const sourceOptions = [
  "Website",
  "Referral",
  "LinkedIn",
  "Instagram",
  "Google",
  "Email",
  "Other",
];

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("crm_token") || ""
  );

  const [page, setPage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("crm_theme") !== "light"
  );

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [toast, setToast] = useState(null);

  const searchRef = useRef(null);

  const [loginForm, setLoginForm] = useState({
    email: "admin@minicrm.com",
    password: "Admin@123",
  });

  const [leadForm, setLeadForm] = useState(emptyLead);

  const [settings, setSettings] = useState({
    workspace: "Mini CRM Workspace",
    adminEmail: "admin@minicrm.com",
    defaultSource: "Website",
    timezone: "Asia/Kolkata",
    newLeadNotifications: true,
    followUpReminders: true,
    weeklySummary: true,
  });

  const [followUpForm, setFollowUpForm] = useState({
    date: "",
    note: "",
  });

  useEffect(() => {
    if (token) {
      fetchLeads();
    }
  }, [token]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("crm_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handleKeyboard = (event) => {
      if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (
        event.key.toLowerCase() === "n" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        setShowLeadModal(true);
      }

      if (event.key === "Escape") {
        setShowLeadModal(false);
        setShowLeadDetails(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    setToken("");
    setLeads([]);
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leads");

      setLeads(response.data || []);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        logout();
      } else {
        setError("Unable to load leads. Please check the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (event) => {
    event.preventDefault();

    try {
      setLoginLoading(true);
      setError("");

      const response = await axios.post(`${API_URL}/auth/login`, loginForm);

      localStorage.setItem("crm_token", response.data.token);
      setToken(response.data.token);

      showToast("Welcome back to Mini CRM");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your email and password."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const createLead = async (event) => {
    event.preventDefault();

    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      showToast("Name and email are required", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/leads", leadForm);

      setLeads((prev) => [response.data, ...prev]);
      setLeadForm(emptyLead);
      setShowLeadModal(false);

      showToast("Lead added successfully");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Could not create lead",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (lead, status) => {
    try {
      const response = await api.patch(`/leads/${lead._id}/status`, {
        status,
      });

      setLeads((prev) =>
        prev.map((item) =>
          item._id === lead._id ? { ...item, ...response.data } : item
        )
      );

      setSelectedLead((prev) =>
        prev?._id === lead._id
          ? { ...prev, ...response.data }
          : prev
      );

      showToast(`Lead moved to ${status}`);
    } catch (err) {
      showToast("Unable to update status", "error");
    }
  };

  const deleteLead = async (lead) => {
    const confirmed = window.confirm(
      `Delete ${lead.name} from your leads?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/leads/${lead._id}`);

      setLeads((prev) =>
        prev.filter((item) => item._id !== lead._id)
      );

      setSelectedLead(null);
      setShowLeadDetails(false);

      showToast("Lead deleted");
    } catch (err) {
      showToast("Unable to delete lead", "error");
    }
  };

  const updateNotes = async () => {
    if (!selectedLead) return;

    try {
      const response = await api.patch(
        `/leads/${selectedLead._id}/notes`,
        {
          notes: selectedLead.notes || "",
        }
      );

      setLeads((prev) =>
        prev.map((item) =>
          item._id === selectedLead._id
            ? { ...item, ...response.data }
            : item
        )
      );

      setSelectedLead((prev) => ({
        ...prev,
        ...response.data,
      }));

      showToast("Notes saved");
    } catch (err) {
      showToast("Could not save notes", "error");
    }
  };

  const addFollowUp = async (event) => {
    event.preventDefault();

    if (!selectedLead || !followUpForm.date) {
      showToast("Select a follow-up date", "error");
      return;
    }

    try {
      const response = await api.post(
        `/leads/${selectedLead._id}/followups`,
        followUpForm
      );

      setLeads((prev) =>
        prev.map((item) =>
          item._id === selectedLead._id
            ? { ...item, ...response.data }
            : item
        )
      );

      setSelectedLead((prev) => ({
        ...prev,
        ...response.data,
      }));

      setFollowUpForm({
        date: "",
        note: "",
      });

      showToast("Follow-up scheduled");
    } catch (err) {
      showToast("Unable to schedule follow-up", "error");
    }
  };

  const filteredLeads = useMemo(() => {
    const query = `${search} ${globalSearch}`.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !query ||
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.source?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      const matchesSource =
        sourceFilter === "All" || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, search, globalSearch, statusFilter, sourceFilter]);

  const stats = useMemo(() => {
    const total = leads.length;

    const newLeads = leads.filter(
      (lead) => lead.status === "New"
    ).length;

    const contacted = leads.filter(
      (lead) => lead.status === "Contacted"
    ).length;

    const converted = leads.filter(
      (lead) => lead.status === "Converted"
    ).length;

    const notInterested = leads.filter(
      (lead) => lead.status === "Not Interested"
    ).length;

    const conversionRate = total
      ? Math.round((converted / total) * 100)
      : 0;

    return {
      total,
      newLeads,
      contacted,
      converted,
      notInterested,
      conversionRate,
    };
  }, [leads]);

  const sourceStats = useMemo(() => {
    const map = {};

    leads.forEach((lead) => {
      const source = lead.source || "Other";

      if (!map[source]) {
        map[source] = {
          total: 0,
          converted: 0,
        };
      }

      map[source].total += 1;

      if (lead.status === "Converted") {
        map[source].converted += 1;
      }
    });

    return Object.entries(map)
      .map(([source, value]) => ({
        source,
        ...value,
        rate: value.total
          ? Math.round((value.converted / value.total) * 100)
          : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [leads]);

  const followUps = useMemo(() => {
    const result = [];

    leads.forEach((lead) => {
      (lead.followUps || []).forEach((followUp) => {
        result.push({
          ...followUp,
          lead,
        });
      });
    });

    return result.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [leads]);

  const upcomingFollowUps = followUps.filter(
    (item) => new Date(item.date) >= new Date()
  );

  const overdueFollowUps = followUps.filter(
    (item) => new Date(item.date) < new Date()
  );

  const recentLeads = [...leads]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 6);

  const openLead = (lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const goTo = (target) => {
    setPage(target);
    setSidebarOpen(false);
  };

  const exportCSV = () => {
    const rows = filteredLeads.map((lead) => ({
      Name: lead.name || "",
      Email: lead.email || "",
      Phone: lead.phone || "",
      Source: lead.source || "",
      Status: lead.status || "",
      Notes: lead.notes || "",
    }));

    if (!rows.length) {
      showToast("No leads to export", "error");
      return;
    }

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) =>
            `"${String(row[header]).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mini-crm-leads.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("CSV exported successfully");
  };

  if (!token) {
    return (
      <LoginPage
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        login={login}
        loading={loginLoading}
        error={error}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        goTo={goTo}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="main-area">
        <Topbar
          searchRef={searchRef}
          globalSearch={globalSearch}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setGlobalSearch={setGlobalSearch}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          goTo={goTo}
          logout={logout}
          upcomingFollowUps={upcomingFollowUps}
          openLead={openLead}
          setShowLeadModal={setShowLeadModal}
        />

        <div className="page-content">
          {error && (
            <div className="error-banner">
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button onClick={fetchLeads}>
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          )}

          {page === "dashboard" && (
            <Dashboard
              stats={stats}
              recentLeads={recentLeads}
              leads={leads}
              followUps={followUps}
              sourceStats={sourceStats}
              openLead={openLead}
              goTo={goTo}
              setShowLeadModal={setShowLeadModal}
              loading={loading}
            />
          )}

          {page === "leads" && (
            <LeadsPage
              leads={filteredLeads}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sourceFilter={sourceFilter}
              setSourceFilter={setSourceFilter}
              openLead={openLead}
              updateStatus={updateStatus}
              deleteLead={deleteLead}
              setShowLeadModal={setShowLeadModal}
              exportCSV={exportCSV}
              loading={loading}
            />
          )}

          {page === "analytics" && (
            <AnalyticsPage
              stats={stats}
              sourceStats={sourceStats}
              leads={leads}
            />
          )}

          {page === "followups" && (
            <FollowUpsPage
              followUps={followUps}
              upcomingFollowUps={upcomingFollowUps}
              overdueFollowUps={overdueFollowUps}
              openLead={openLead}
              goTo={goTo}
            />
          )}

          {page === "website" && (
            <WebsitePage
              leads={leads}
              openLead={openLead}
              goTo={goTo}
            />
          )}

          {page === "settings" && (
            <SettingsPage
              settings={settings}
              setSettings={setSettings}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              logout={logout}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {showLeadModal && (
        <LeadModal
          form={leadForm}
          setForm={setLeadForm}
          submit={createLead}
          close={() => {
            setShowLeadModal(false);
            setLeadForm(emptyLead);
          }}
          loading={loading}
        />
      )}

      {showLeadDetails && selectedLead && (
        <LeadDetails
          lead={selectedLead}
          setLead={setSelectedLead}
          close={() => setShowLeadDetails(false)}
          updateStatus={updateStatus}
          deleteLead={deleteLead}
          updateNotes={updateNotes}
          addFollowUp={addFollowUp}
          followUpForm={followUpForm}
          setFollowUpForm={setFollowUpForm}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "error" ? (
            <AlertTriangle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}

          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function LoginPage({
  loginForm,
  setLoginForm,
  login,
  loading,
  error,
  darkMode,
  setDarkMode,
}) {
  return (
    <div className="login-page">
      <button
        className="login-theme-button"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="login-decoration decoration-one" />
      <div className="login-decoration decoration-two" />

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <Target size={25} />
          </div>

          <div>
            <strong>Mini CRM</strong>
            <span>Lead Management</span>
          </div>
        </div>

        <div className="login-heading">
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Manage every lead with clarity.</h1>
          <p>
            Track enquiries, organize follow-ups and turn
            opportunities into customers.
          </p>
        </div>

        <form onSubmit={login}>
          <label>Email address</label>

          <div className="input-wrap">
            <Mail size={18} />
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  email: e.target.value,
                })
              }
              placeholder="admin@minicrm.com"
            />
          </div>

          <label>Password</label>

          <div className="input-wrap">
            <LockKeyhole size={18} />
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value,
                })
              }
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="login-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button
            className="primary-button login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="spin" size={18} />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowUpRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <ShieldCheck size={15} />
          Secure administrator access
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  page,
  goTo,
  logout,
  sidebarOpen,
  setSidebarOpen,
}) {
  const menu = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "leads",
      label: "Leads",
      icon: Users,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "followups",
      label: "Follow-ups",
      icon: CalendarCheck2,
    },
    {
      id: "website",
      label: "Website Enquiries",
      icon: Globe,
    },
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${
          sidebarOpen ? "show" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Target size={23} />
          </div>

          <div>
            <strong>Mini CRM</strong>
            <span>Lead Management</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  page === item.id ? "active" : ""
                }`}
                onClick={() => goTo(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {item.id === "leads" && (
                  <small>{}</small>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-section-label settings-label">
          SYSTEM
        </div>

        <button
          className={`nav-item ${
            page === "settings" ? "active" : ""
          }`}
          onClick={() => goTo("settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="sidebar-spacer" />

        <div className="sidebar-help">
          <div className="help-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>Smart workspace</strong>
            <p>
              Use <kbd>N</kbd> for a new lead
            </p>
          </div>
        </div>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
    </>
  );
}

function Topbar({
  searchRef,
  globalSearch,
  sidebarOpen,
  setSidebarOpen,
  setGlobalSearch,
  showNotifications,
  setShowNotifications,
  showProfileMenu,
  setShowProfileMenu,
  darkMode,
  setDarkMode,
  goTo,
  logout,
  upcomingFollowUps,
  openLead,
  setShowLeadModal,
}) {
  return (
    <header className="topbar">
      <div className="mobile-menu">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div className="topbar-search">
        <Search size={18} />

        <input
          ref={searchRef}
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);

            if (e.target.value) {
              goTo("leads");
            }
          }}
          placeholder="Search leads, emails, sources..."
        />

        <kbd>/</kbd>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-button"
          title="Add lead"
          onClick={() => setShowLeadModal(true)}
        >
          <Plus size={19} />
        </button>

        <div className="notification-wrapper">
          <button
            className="icon-button notification-button"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          >
            <Bell size={19} />

            {upcomingFollowUps.length > 0 && (
              <span className="notification-dot">
                {Math.min(upcomingFollowUps.length, 9)}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown notification-dropdown">
              <div className="dropdown-heading">
                <div>
                  <strong>Notifications</strong>
                  <span>
                    {upcomingFollowUps.length} upcoming
                  </span>
                </div>

                <BellRing size={17} />
              </div>

              {upcomingFollowUps.length === 0 ? (
                <div className="empty-dropdown">
                  <CheckCheck size={25} />
                  <p>You're all caught up</p>
                  <span>No upcoming follow-ups.</span>
                </div>
              ) : (
                upcomingFollowUps.slice(0, 5).map((item, index) => (
                  <button
                    className="notification-item"
                    key={`${item.lead._id}-${index}`}
                    onClick={() => {
                      openLead(item.lead);
                      setShowNotifications(false);
                    }}
                  >
                    <div className="notification-icon">
                      <CalendarDays size={16} />
                    </div>

                    <div>
                      <strong>{item.lead.name}</strong>
                      <span>
                        {item.note || "Follow-up scheduled"}
                      </span>
                    </div>
                  </button>
                ))
              )}

              <button
                className="dropdown-footer"
                onClick={() => {
                  goTo("followups");
                  setShowNotifications(false);
                }}
              >
                View follow-up schedule
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        <button
          className="icon-button"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle theme"
        >
          {darkMode ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        <div className="profile-wrapper">
          <button
            className="profile-button"
            onClick={() =>
              setShowProfileMenu(!showProfileMenu)
            }
          >
            <div className="avatar">A</div>

            <div className="profile-text">
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {showProfileMenu && (
            <div className="dropdown profile-dropdown">
              <button
                onClick={() => {
                  goTo("settings");
                  setShowProfileMenu(false);
                }}
              >
                <Settings size={17} />
                Settings
              </button>

              <button onClick={logout}>
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Dashboard({
  stats,
  recentLeads,
  leads,
  followUps,
  sourceStats,
  openLead,
  goTo,
  setShowLeadModal,
  loading,
}) {
  const today = new Date();

  const todayFollowUps = followUps.filter((item) => {
    const date = new Date(item.date);

    return (
      date.toDateString() === today.toDateString()
    );
  });

  return (
    <div className="page">
      <PageHeader
        eyebrow="OVERVIEW"
        title="Good to see you, Admin."
        subtitle="Here's what's happening across your lead pipeline."
      />

      <div className="stats-grid">
        <StatCard
          label="Total Leads"
          value={stats.total}
          icon={Users}
          accent="violet"
          helper="All captured enquiries"
        />

        <StatCard
          label="New Leads"
          value={stats.newLeads}
          icon={UserPlus}
          accent="amber"
          helper="Waiting for first contact"
        />

        <StatCard
          label="Contacted"
          value={stats.contacted}
          icon={PhoneCall}
          accent="cyan"
          helper="Active conversations"
        />

        <StatCard
          label="Converted"
          value={stats.converted}
          icon={UserCheck}
          accent="green"
          helper={`${stats.conversionRate}% conversion rate`}
        />
      </div>

      <div className="dashboard-grid-main">
        <section className="card recent-card">
          <SectionHeader
            title="Recent leads"
            subtitle="Latest opportunities entering your CRM"
            action={
              <button
                className="text-button"
                onClick={() => goTo("leads")}
              >
                View all
                <ArrowUpRight size={15} />
              </button>
            }
          />

          {loading ? (
            <LoadingState />
          ) : recentLeads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No leads yet"
              text="Start by adding your first client lead."
              button="Add lead"
              onClick={() => setShowLeadModal(true)}
            />
          ) : (
            <div className="lead-list">
              {recentLeads.map((lead) => (
                <LeadRow
                  key={lead._id}
                  lead={lead}
                  openLead={openLead}
                />
              ))}
            </div>
          )}
        </section>

        <section className="card focus-card">
          <SectionHeader
            title="Today's focus"
            subtitle="Items that need your attention"
          />

          <div className="focus-summary">
            <div className="focus-ring">
              <span>{todayFollowUps.length}</span>
              <small>today</small>
            </div>

            <div>
              <strong>
                {todayFollowUps.length
                  ? "Follow-ups scheduled"
                  : "No follow-ups today"}
              </strong>

              <p>
                {todayFollowUps.length
                  ? "Stay on top of today's conversations."
                  : "Your schedule is clear for today."}
              </p>
            </div>
          </div>

          <div className="focus-list">
            <FocusItem
              icon={UserPlus}
              label="New leads"
              value={stats.newLeads}
              tone="amber"
            />

            <FocusItem
              icon={Clock3}
              label="Pending follow-ups"
              value={followUps.length}
              tone="violet"
            />

            <FocusItem
              icon={TrendingUp}
              label="Conversion rate"
              value={`${stats.conversionRate}%`}
              tone="green"
            />
          </div>

          <button
            className="outline-button full-width"
            onClick={() => goTo("followups")}
          >
            Open schedule
            <CalendarDays size={16} />
          </button>
        </section>
      </div>

      <div className="dashboard-grid-bottom">
        <section className="card">
          <SectionHeader
            title="Pipeline"
            subtitle="Current lead distribution"
            action={
              <button
                className="icon-small-button"
                onClick={() => goTo("analytics")}
              >
                <ArrowUpRight size={16} />
              </button>
            }
          />

          <PipelineVisual stats={stats} />
        </section>

        <section className="card">
          <SectionHeader
            title="Lead sources"
            subtitle="Where your enquiries are coming from"
          />

          <SourceBars sourceStats={sourceStats} />
        </section>
      </div>

      <section className="card workflow-card">
        <SectionHeader
          title="Lead workflow"
          subtitle="A simple path from enquiry to conversion"
        />

        <div className="workflow">
          <WorkflowStep
            number="01"
            icon={MousePointerClick}
            title="Capture"
            text="Website and other channels create new leads."
          />

          <div className="workflow-line" />

          <WorkflowStep
            number="02"
            icon={PhoneCall}
            title="Connect"
            text="Contact prospects and record conversations."
          />

          <div className="workflow-line" />

          <WorkflowStep
            number="03"
            icon={MessageSquare}
            title="Follow up"
            text="Schedule the next action so no lead is forgotten."
          />

          <div className="workflow-line" />

          <WorkflowStep
            number="04"
            icon={CircleDollarSign}
            title="Convert"
            text="Move qualified prospects into converted status."
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  helper,
}) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-top">
        <div className="stat-icon">
          <Icon size={20} />
        </div>

        <ArrowUpRight size={16} className="stat-arrow" />
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-label">{label}</div>

      <div className="stat-helper">{helper}</div>
    </div>
  );
}

function LeadsPage({
  leads,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  openLead,
  updateStatus,
  deleteLead,
  setShowLeadModal,
  exportCSV,
  loading,
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="LEAD MANAGEMENT"
        title="Leads"
        subtitle="Manage, qualify and convert your client enquiries."
      />

      <div className="leads-toolbar card">
        <div className="table-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or source..."
          />
        </div>

        <div className="toolbar-controls">
          <div className="select-wrap">
            <Filter size={16} />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">All statuses</option>

              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="select-wrap">
            <Globe size={16} />

            <select
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value)
              }
            >
              <option value="All">All sources</option>

              {sourceOptions.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </div>

          <button
            className="outline-button"
            onClick={exportCSV}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <section className="card table-card">
        <div className="table-heading">
          <div>
            <strong>{leads.length} leads</strong>
            <span>matching your current filters</span>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No matching leads"
            text="Try changing your search or filters."
            button="Add lead"
            onClick={() => setShowLeadModal(true)}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <button
                        className="lead-cell"
                        onClick={() => openLead(lead)}
                      >
                        <div className="lead-avatar">
                          {getInitials(lead.name)}
                        </div>

                        <div>
                          <strong>{lead.name}</strong>
                          <span>{getLeadQuality(lead)} lead</span>
                        </div>
                      </button>
                    </td>

                    <td>
                      <div className="contact-cell">
                        <span>
                          <Mail size={14} />
                          {lead.email}
                        </span>

                        {lead.phone && (
                          <span>
                            <Phone size={14} />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="source-pill">
                        {lead.source || "Website"}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`status-select status-${slugify(
                          lead.status
                        )}`}
                        value={lead.status}
                        onChange={(e) =>
                          updateStatus(
                            lead,
                            e.target.value
                          )
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <span className="date-text">
                        {formatDate(lead.createdAt)}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="row-action"
                          onClick={() => openLead(lead)}
                          title="View lead"
                        >
                          <ArrowUpRight size={16} />
                        </button>

                        <button
                          className="row-action danger"
                          onClick={() => deleteLead(lead)}
                          title="Delete lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function AnalyticsPage({
  stats,
  sourceStats,
  leads,
}) {
  const maxSource = Math.max(
    ...sourceStats.map((item) => item.total),
    1
  );

  const pipeline = [
    {
      label: "New",
      value: stats.newLeads,
      percentage: stats.total
        ? Math.round((stats.newLeads / stats.total) * 100)
        : 0,
      tone: "amber",
    },
    {
      label: "Contacted",
      value: stats.contacted,
      percentage: stats.total
        ? Math.round((stats.contacted / stats.total) * 100)
        : 0,
      tone: "violet",
    },
    {
      label: "Converted",
      value: stats.converted,
      percentage: stats.total
        ? Math.round((stats.converted / stats.total) * 100)
        : 0,
      tone: "green",
    },
    {
      label: "Not Interested",
      value: stats.notInterested,
      percentage: stats.total
        ? Math.round(
            (stats.notInterested / stats.total) * 100
          )
        : 0,
      tone: "red",
    },
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="PERFORMANCE"
        title="Analytics"
        subtitle="Understand your pipeline, sources and conversion movement."
      />

      <div className="analytics-summary">
        <div className="analytics-highlight">
          <div className="highlight-icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Conversion rate</span>
            <strong>{stats.conversionRate}%</strong>
          </div>

          <div className="highlight-track">
            <div
              style={{
                width: `${stats.conversionRate}%`,
              }}
            />
          </div>
        </div>

        <div className="analytics-highlight">
          <div className="highlight-icon amber">
            <Users size={21} />
          </div>

          <div>
            <span>Total leads</span>
            <strong>{stats.total}</strong>
          </div>

          <small>All captured opportunities</small>
        </div>

        <div className="analytics-highlight">
          <div className="highlight-icon green">
            <UserCheck size={21} />
          </div>

          <div>
            <span>Converted</span>
            <strong>{stats.converted}</strong>
          </div>

          <small>Successfully converted leads</small>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="card analytics-pipeline">
          <SectionHeader
            title="Pipeline distribution"
            subtitle="How your leads are moving through the funnel"
          />

          <div className="donut-layout">
            <div
              className="donut-chart"
              style={{
                background: createConicGradient(pipeline),
              }}
            >
              <div className="donut-inner">
                <strong>{stats.total}</strong>
                <span>Total</span>
              </div>
            </div>

            <div className="donut-legend">
              {pipeline.map((item) => (
                <div
                  className="legend-row"
                  key={item.label}
                >
                  <div>
                    <span
                      className={`legend-dot ${item.tone}`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <strong>
                    {item.value}
                    <small>{item.percentage}%</small>
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <SectionHeader
            title="Source performance"
            subtitle="Lead volume by acquisition channel"
          />

          {sourceStats.length === 0 ? (
            <EmptyMini />
          ) : (
            <div className="source-chart">
              {sourceStats.slice(0, 7).map((item) => (
                <div
                  className="source-chart-row"
                  key={item.source}
                >
                  <div className="source-chart-label">
                    <span>{item.source}</span>
                    <strong>{item.total}</strong>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${
                          (item.total / maxSource) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <span className="source-rate">
                    {item.rate}% converted
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="analytics-grid">
        <section className="card">
          <SectionHeader
            title="Pipeline health"
            subtitle="Current status balance across your CRM"
          />

          <div className="health-grid">
            {pipeline.map((item) => (
              <div
                className={`health-card health-${item.tone}`}
                key={item.label}
              >
                <div className="health-icon">
                  {item.tone === "green" ? (
                    <CheckCircle2 size={20} />
                  ) : item.tone === "amber" ? (
                    <Clock3 size={20} />
                  ) : item.tone === "red" ? (
                    <XCircle size={20} />
                  ) : (
                    <Activity size={20} />
                  )}
                </div>

                <span>{item.label}</span>

                <strong>{item.value}</strong>

                <small>{item.percentage}% of pipeline</small>
              </div>
            ))}
          </div>
        </section>

        <section className="card insight-card">
          <SectionHeader
            title="CRM insights"
            subtitle="Quick observations from your current data"
          />

          <Insight
            icon={Target}
            title={
              stats.newLeads
                ? `${stats.newLeads} leads need first contact`
                : "No untouched leads"
            }
            text={
              stats.newLeads
                ? "Move new enquiries to Contacted after your first interaction."
                : "Your current new-lead queue is clear."
            }
          />

          <Insight
            icon={Zap}
            title={`${stats.contacted} active conversations`}
            text="Keep follow-ups scheduled so active opportunities do not become stale."
          />

          <Insight
            icon={UserCheck}
            title={`${stats.converted} converted leads`}
            text="Converted records provide the clearest signal of your current pipeline outcome."
          />
        </section>
      </div>

      <section className="card activity-visual">
        <SectionHeader
          title="Lead activity overview"
          subtitle="Visual view of your current lead mix"
        />

        <div className="activity-columns">
          {pipeline.map((item) => (
            <div
              className="activity-column"
              key={item.label}
            >
              <div className="activity-column-value">
                {item.value}
              </div>

              <div className="activity-column-track">
                <div
                  className={`activity-column-fill ${item.tone}`}
                  style={{
                    height: `${Math.max(
                      item.percentage,
                      item.value ? 8 : 2
                    )}%`,
                  }}
                />
              </div>

              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="analytics-footer-note">
        <Info size={17} />
        Analytics are calculated from the leads currently stored in your CRM.
      </div>
    </div>
  );
}

function FollowUpsPage({
  followUps,
  upcomingFollowUps,
  overdueFollowUps,
  openLead,
  goTo,
}) {
  const grouped = groupFollowUpsByDate(upcomingFollowUps);

  return (
    <div className="page">
      <PageHeader
        eyebrow="SALES WORKFLOW"
        title="Follow-ups & Schedule"
        subtitle="Keep every conversation moving with a clear next action."
      />

      <div className="followup-summary">
        <SummaryMini
          icon={CalendarCheck2}
          label="Upcoming"
          value={upcomingFollowUps.length}
          tone="violet"
        />

        <SummaryMini
          icon={AlertTriangle}
          label="Overdue"
          value={overdueFollowUps.length}
          tone="red"
        />

        <SummaryMini
          icon={Timer}
          label="Scheduled"
          value={followUps.length}
          tone="amber"
        />

        <SummaryMini
          icon={CheckCheck}
          label="Active pipeline"
          value={followUps.filter(
            (item) => item.lead.status !== "Converted"
          ).length}
          tone="green"
        />
      </div>

      <div className="schedule-layout">
        <section className="card schedule-card">
          <SectionHeader
            title="Upcoming schedule"
            subtitle="Your next planned sales actions"
          />

          {Object.keys(grouped).length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Schedule is clear"
              text="Open a lead and add a follow-up to build your sales schedule."
              button="View leads"
              onClick={() => goTo("leads")}
            />
          ) : (
            <div className="schedule-list">
              {Object.entries(grouped).map(
                ([date, items]) => (
                  <div
                    className="schedule-day"
                    key={date}
                  >
                    <div className="schedule-date">
                      <div className="date-box">
                        <strong>
                          {new Date(date).getDate()}
                        </strong>

                        <span>
                          {new Date(date).toLocaleDateString(
                            "en-IN",
                            {
                              month: "short",
                            }
                          )}
                        </span>
                      </div>

                      <div>
                        <strong>
                          {formatLongDate(date)}
                        </strong>

                        <span>
                          {items.length} scheduled action
                          {items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="schedule-items">
                      {items.map((item, index) => (
                        <button
                          className="schedule-item"
                          key={`${item.lead._id}-${index}`}
                          onClick={() =>
                            openLead(item.lead)
                          }
                        >
                          <div className="schedule-item-icon">
                            <PhoneCall size={17} />
                          </div>

                          <div className="schedule-item-main">
                            <strong>
                              {item.lead.name}
                            </strong>

                            <span>
                              {item.note ||
                                "Follow-up action"}
                            </span>
                          </div>

                          <div className="schedule-status">
                            {item.lead.status}
                          </div>

                          <ChevronRight size={17} />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <aside className="card schedule-side">
          <SectionHeader
            title="Workflow tips"
            subtitle="Keep your pipeline organized"
          />

          <WorkflowTip
            number="01"
            title="Always schedule the next step"
            text="Every active lead should have a clear next action."
          />

          <WorkflowTip
            number="02"
            title="Keep notes specific"
            text="Record what the client needs and what you promised to do next."
          />

          <WorkflowTip
            number="03"
            title="Update status immediately"
            text="A current status makes the dashboard and analytics more useful."
          />

          <button
            className="outline-button full-width"
            onClick={() => goTo("leads")}
          >
            Manage leads
            <Users size={16} />
          </button>
        </aside>
      </div>

      {overdueFollowUps.length > 0 && (
        <section className="card overdue-card">
          <SectionHeader
            title="Overdue follow-ups"
            subtitle="These actions have passed their scheduled date."
          />

          <div className="overdue-list">
            {overdueFollowUps.map((item, index) => (
              <button
                className="overdue-item"
                key={`${item.lead._id}-${index}`}
                onClick={() => openLead(item.lead)}
              >
                <div className="overdue-icon">
                  <AlertTriangle size={18} />
                </div>

                <div>
                  <strong>{item.lead.name}</strong>
                  <span>
                    {item.note || "Follow-up overdue"}
                  </span>
                </div>

                <time>
                  {formatDate(item.date)}
                </time>

                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function WebsitePage({
  leads,
  openLead,
  goTo,
}) {
  const websiteLeads = leads.filter(
    (lead) => lead.source === "Website"
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="INBOUND CHANNEL"
        title="Website Enquiries"
        subtitle="Leads generated from your website contact forms."
      />

      <div className="website-hero card">
        <div className="website-hero-icon">
          <Globe size={28} />
        </div>

        <div>
          <span className="eyebrow">WEBSITE CHANNEL</span>

          <h2>
            {websiteLeads.length} website enquiries
          </h2>

          <p>
            Every website enquiry enters the CRM as a
            new lead, ready for follow-up.
          </p>
        </div>

        <div className="website-hero-stat">
          <strong>
            {
              websiteLeads.filter(
                (lead) => lead.status === "Converted"
              ).length
            }
          </strong>

          <span>converted</span>
        </div>
      </div>

      <section className="card table-card">
        <SectionHeader
          title="Website lead queue"
          subtitle="Recent enquiries captured through the website"
          action={
            <button
              className="text-button"
              onClick={() => goTo("leads")}
            >
              All leads
              <ArrowUpRight size={15} />
            </button>
          }
        />

        {websiteLeads.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No website enquiries"
            text="Website form submissions will appear here automatically."
          />
        ) : (
          <div className="website-leads">
            {websiteLeads.map((lead) => (
              <button
                className="website-lead"
                key={lead._id}
                onClick={() => openLead(lead)}
              >
                <div className="lead-avatar">
                  {getInitials(lead.name)}
                </div>

                <div className="website-lead-info">
                  <strong>{lead.name}</strong>
                  <span>{lead.email}</span>
                </div>

                <StatusBadge status={lead.status} />

                <span className="date-text">
                  {formatDate(lead.createdAt)}
                </span>

                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SettingsPage({
  settings,
  setSettings,
  darkMode,
  setDarkMode,
  logout,
  showToast,
}) {
  const saveSettings = () => {
    localStorage.setItem(
      "crm_settings",
      JSON.stringify(settings)
    );

    showToast("Settings saved successfully");
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Settings"
        subtitle="Customize your CRM workspace and notification preferences."
      />

      <div className="settings-layout">
        <div className="settings-main">
          <section className="settings-section card">
            <SettingsHeading
              icon={SlidersHorizontal}
              title="Workspace"
              subtitle="Basic information for your CRM workspace."
            />

            <div className="settings-form-grid">
              <SettingField
                label="Workspace name"
                icon={Target}
              >
                <input
                  value={settings.workspace}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workspace: e.target.value,
                    })
                  }
                />
              </SettingField>

              <SettingField
                label="Administrator email"
                icon={Mail}
              >
                <input
                  value={settings.adminEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      adminEmail: e.target.value,
                    })
                  }
                />
              </SettingField>

              <SettingField
                label="Default lead source"
                icon={Globe}
              >
                <select
                  value={settings.defaultSource}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultSource: e.target.value,
                    })
                  }
                >
                  {sourceOptions.map((source) => (
                    <option key={source}>{source}</option>
                  ))}
                </select>
              </SettingField>

              <SettingField
                label="Timezone"
                icon={Clock3}
              >
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      timezone: e.target.value,
                    })
                  }
                >
                  <option value="Asia/Kolkata">
                    India — Asia/Kolkata
                  </option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Dubai">
                    Dubai — Asia/Dubai
                  </option>
                  <option value="Europe/London">
                    London — Europe/London
                  </option>
                </select>
              </SettingField>
            </div>
          </section>

          <section className="settings-section card">
            <SettingsHeading
              icon={BellRing}
              title="Notifications"
              subtitle="Choose which CRM events should get your attention."
            />

            <SettingToggle
              icon={UserPlus}
              title="New lead notifications"
              description="Notify me when a new lead is added."
              checked={settings.newLeadNotifications}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  newLeadNotifications: checked,
                })
              }
            />

            <SettingToggle
              icon={CalendarCheck2}
              title="Follow-up reminders"
              description="Show upcoming follow-up reminders in the CRM."
              checked={settings.followUpReminders}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  followUpReminders: checked,
                })
              }
            />

            <SettingToggle
              icon={BarChart3}
              title="Weekly summary"
              description="Keep a weekly overview of your lead activity."
              checked={settings.weeklySummary}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  weeklySummary: checked,
                })
              }
            />
          </section>

          <section className="settings-section card">
            <SettingsHeading
              icon={Palette}
              title="Appearance"
              subtitle="Choose how Mini CRM looks on your screen."
            />

            <div className="theme-options">
              <ThemeOption
                active={!darkMode}
                icon={Sun}
                title="Light"
                description="Bright and clean"
                onClick={() => setDarkMode(false)}
              />

              <ThemeOption
                active={darkMode}
                icon={Moon}
                title="Dark"
                description="Low-light workspace"
                onClick={() => setDarkMode(true)}
              />
            </div>
          </section>

          <section className="settings-section card">
            <SettingsHeading
              icon={ShieldCheck}
              title="Security"
              subtitle="Administrator access and session controls."
            />

            <div className="security-row">
              <div className="security-icon">
                <KeyRound size={19} />
              </div>

              <div>
                <strong>Administrator authentication</strong>
                <span>
                  Protected with token-based login.
                </span>
              </div>

              <span className="security-status">
                Active
              </span>
            </div>

            <div className="security-row">
              <div className="security-icon">
                <LockKeyhole size={19} />
              </div>

              <div>
                <strong>Session protection</strong>
                <span>
                  Authenticated CRM requests use your secure session token.
                </span>
              </div>

              <span className="security-status">
                Enabled
              </span>
            </div>
          </section>

          <div className="settings-actions">
            <button
              className="primary-button"
              onClick={saveSettings}
            >
              <Save size={17} />
              Save changes
            </button>

            <button
              className="outline-button danger-outline"
              onClick={logout}
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </div>

        <aside className="settings-sidebar">
          <div className="settings-profile card">
            <div className="large-avatar">A</div>

            <h3>Administrator</h3>

            <p>{settings.adminEmail}</p>

            <span className="role-pill">
              <ShieldCheck size={14} />
              Workspace Admin
            </span>
          </div>

          <div className="settings-info card">
            <div className="settings-info-icon">
              <Database size={19} />
            </div>

            <strong>CRM configuration</strong>

            <p>
              Your lead data is managed through the
              connected Mini CRM backend.
            </p>

            <div className="settings-info-line">
              <span>Lead management</span>
              <strong>Enabled</strong>
            </div>

            <div className="settings-info-line">
              <span>Follow-ups</span>
              <strong>Enabled</strong>
            </div>

            <div className="settings-info-line">
              <span>Analytics</span>
              <strong>Live</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LeadModal({
  form,
  setForm,
  submit,
  close,
  loading,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div
        className="modal-card lead-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title="Add new lead"
          subtitle="Create a lead manually in your CRM."
          close={close}
        />

        <form onSubmit={submit}>
          <div className="form-grid">
            <FormField label="Full name" required>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Enter client name"
              />
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="client@email.com"
              />
            </FormField>

            <FormField label="Phone">
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                placeholder="+91 98765 43210"
              />
            </FormField>

            <FormField label="Source">
              <select
                value={form.source}
                onChange={(e) =>
                  setForm({
                    ...form,
                    source: e.target.value,
                  })
                }
              >
                {sourceOptions.map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Initial notes">
            <textarea
              rows="4"
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              placeholder="Add useful context about this lead..."
            />
          </FormField>

          <div className="modal-actions">
            <button
              type="button"
              className="outline-button"
              onClick={close}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              disabled={loading}
            >
              <Plus size={17} />
              {loading ? "Adding..." : "Add lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LeadDetails({
  lead,
  setLead,
  close,
  updateStatus,
  deleteLead,
  updateNotes,
  addFollowUp,
  followUpForm,
  setFollowUpForm,
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={close}
    >
      <div
        className="modal-card details-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title={lead.name}
          subtitle={lead.email}
          close={close}
        />

        <div className="details-header">
          <div className="details-avatar">
            {getInitials(lead.name)}
          </div>

          <div>
            <div className="details-name-row">
              <h2>{lead.name}</h2>
              <StatusBadge status={lead.status} />
            </div>

            <div className="details-contact">
              <span>
                <Mail size={15} />
                {lead.email}
              </span>

              {lead.phone && (
                <span>
                  <Phone size={15} />
                  {lead.phone}
                </span>
              )}

              <span>
                <Globe size={15} />
                {lead.source || "Website"}
              </span>
            </div>
          </div>
        </div>

        <div className="details-grid">
          <section className="details-section">
            <div className="details-section-heading">
              <div>
                <strong>Lead status</strong>
                <span>Update the current pipeline stage.</span>
              </div>
            </div>

            <div className="status-buttons">
              {statuses.map((status) => (
                <button
                  key={status}
                  className={
                    lead.status === status
                      ? `status-choice active status-${slugify(
                          status
                        )}`
                      : "status-choice"
                  }
                  onClick={() =>
                    updateStatus(lead, status)
                  }
                >
                  {lead.status === status && (
                    <CheckCheck size={15} />
                  )}
                  {status}
                </button>
              ))}
            </div>
          </section>

          <section className="details-section">
            <div className="details-section-heading">
              <div>
                <strong>Notes</strong>
                <span>Keep important client context here.</span>
              </div>

              <button
                className="text-button"
                onClick={updateNotes}
              >
                <Save size={15} />
                Save
              </button>
            </div>

            <textarea
              className="details-textarea"
              value={lead.notes || ""}
              onChange={(e) =>
                setLead({
                  ...lead,
                  notes: e.target.value,
                })
              }
              placeholder="Write notes about this lead..."
              rows="6"
            />
          </section>
        </div>

        <section className="details-section followup-section">
          <div className="details-section-heading">
            <div>
              <strong>Schedule follow-up</strong>
              <span>
                Plan the next conversation with this lead.
              </span>
            </div>

            <CalendarDays size={18} />
          </div>

          <form
            className="followup-form"
            onSubmit={addFollowUp}
          >
            <input
              type="date"
              value={followUpForm.date}
              onChange={(e) =>
                setFollowUpForm({
                  ...followUpForm,
                  date: e.target.value,
                })
              }
            />

            <input
              value={followUpForm.note}
              onChange={(e) =>
                setFollowUpForm({
                  ...followUpForm,
                  note: e.target.value,
                })
              }
              placeholder="What should you follow up about?"
            />

            <button className="primary-button">
              <CalendarCheck2 size={16} />
              Schedule
            </button>
          </form>

          {(lead.followUps || []).length > 0 && (
            <div className="lead-followup-list">
              {[...(lead.followUps || [])]
                .sort(
                  (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
                )
                .map((item, index) => (
                  <div
                    className="lead-followup-item"
                    key={index}
                  >
                    <div className="mini-calendar">
                      <CalendarDays size={16} />
                    </div>

                    <div>
                      <strong>
                        {formatDate(item.date)}
                      </strong>

                      <span>
                        {item.note ||
                          "Scheduled follow-up"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        <div className="details-footer">
          <button
            className="danger-button"
            onClick={() => deleteLead(lead)}
          >
            <Trash2 size={16} />
            Delete lead
          </button>

          <button
            className="primary-button"
            onClick={close}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
}) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function LeadRow({ lead, openLead }) {
  return (
    <button
      className="lead-row"
      onClick={() => openLead(lead)}
    >
      <div className="lead-avatar">
        {getInitials(lead.name)}
      </div>

      <div className="lead-row-main">
        <strong>{lead.name}</strong>

        <span>{lead.email}</span>
      </div>

      <div className="lead-row-source">
        {lead.source || "Website"}
      </div>

      <StatusBadge status={lead.status} />

      <span className="lead-row-date">
        {formatDate(lead.createdAt)}
      </span>

      <ChevronRight size={17} />
    </button>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${slugify(status)}`}>
      <span />
      {status}
    </span>
  );
}

function PipelineVisual({ stats }) {
  const items = [
    {
      label: "New",
      value: stats.newLeads,
      tone: "amber",
    },
    {
      label: "Contacted",
      value: stats.contacted,
      tone: "violet",
    },
    {
      label: "Converted",
      value: stats.converted,
      tone: "green",
    },
    {
      label: "Not Interested",
      value: stats.notInterested,
      tone: "red",
    },
  ];

  const max = Math.max(...items.map((x) => x.value), 1);

  return (
    <div className="pipeline-visual">
      {items.map((item) => (
        <div className="pipeline-item" key={item.label}>
          <div className="pipeline-label">
            <span>
              <i className={`legend-dot ${item.tone}`} />
              {item.label}
            </span>

            <strong>{item.value}</strong>
          </div>

          <div className="pipeline-track">
            <div
              className={`pipeline-fill ${item.tone}`}
              style={{
                width: `${(item.value / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SourceBars({ sourceStats }) {
  if (!sourceStats.length) {
    return <EmptyMini />;
  }

  const max = Math.max(
    ...sourceStats.map((item) => item.total),
    1
  );

  return (
    <div className="source-bars">
      {sourceStats.slice(0, 5).map((item) => (
        <div className="source-bar-row" key={item.source}>
          <div className="source-bar-head">
            <span>{item.source}</span>
            <strong>{item.total}</strong>
          </div>

          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(item.total / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FocusItem({
  icon: Icon,
  label,
  value,
  tone,
}) {
  return (
    <div className="focus-item">
      <div className={`focus-item-icon ${tone}`}>
        <Icon size={17} />
      </div>

      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

function WorkflowStep({
  number,
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="workflow-step">
      <div className="workflow-number">
        {number}
      </div>

      <div className="workflow-icon">
        <Icon size={19} />
      </div>

      <strong>{title}</strong>

      <p>{text}</p>
    </div>
  );
}

function SummaryMini({
  icon: Icon,
  label,
  value,
  tone,
}) {
  return (
    <div className={`summary-mini summary-${tone}`}>
      <div className="summary-icon">
        <Icon size={19} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function WorkflowTip({
  number,
  title,
  text,
}) {
  return (
    <div className="workflow-tip">
      <span>{number}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Insight({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="insight">
      <div className="insight-icon">
        <Icon size={17} />
      </div>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function SettingsHeading({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="settings-heading">
      <div className="settings-heading-icon">
        <Icon size={19} />
      </div>

      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function SettingField({
  label,
  icon: Icon,
  children,
}) {
  return (
    <label className="setting-field">
      <span>
        <Icon size={15} />
        {label}
      </span>

      {children}
    </label>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="setting-toggle-row">
      <div className="setting-toggle-icon">
        <Icon size={18} />
      </div>

      <div className="setting-toggle-text">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <button
        className={`toggle ${
          checked ? "toggle-on" : ""
        }`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span />
      </button>
    </div>
  );
}

function ThemeOption({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      className={`theme-option ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <div className="theme-preview">
        <Icon size={21} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      {active && (
        <CheckCircle2
          size={19}
          className="theme-check"
        />
      )}
    </button>
  );
}

function FormField({
  label,
  required,
  children,
}) {
  return (
    <label className="form-field">
      <span>
        {label}
        {required && <i>*</i>}
      </span>

      {children}
    </label>
  );
}

function ModalHeader({
  title,
  subtitle,
  close,
}) {
  return (
    <div className="modal-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <button
        className="modal-close"
        onClick={close}
      >
        <X size={19} />
      </button>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  button,
  onClick,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={25} />
      </div>

      <h3>{title}</h3>
      <p>{text}</p>

      {button && (
        <button
          className="primary-button"
          onClick={onClick}
        >
          <Plus size={16} />
          {button}
        </button>
      )}
    </div>
  );
}

function EmptyMini() {
  return (
    <div className="empty-mini">
      <BarChart3 size={22} />
      <span>No analytics data yet.</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-state">
      <RefreshCw className="spin" size={24} />
      <span>Loading CRM data...</span>
    </div>
  );
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(value) {
  const date = new Date(value);

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getLeadQuality(lead) {
  let score = 0;

  if (lead.name) score += 25;
  if (lead.email) score += 25;
  if (lead.phone) score += 20;
  if (lead.notes) score += 15;
  if (lead.followUps?.length) score += 15;

  if (score >= 80) return "High";
  if (score >= 50) return "Warm";

  return "New";
}

function createConicGradient(items) {
  const total =
    items.reduce((sum, item) => sum + item.value, 0) || 1;

  const colors = {
    amber: "#f3b562",
    violet: "#9b7cff",
    green: "#63d6a0",
    red: "#ef7890",
  };

  let current = 0;

  const parts = items.map((item) => {
    const start = current;
    current += (item.value / total) * 100;

    return `${colors[item.tone]} ${start}% ${current}%`;
  });

  return `conic-gradient(${parts.join(", ")})`;
}

function groupFollowUpsByDate(items) {
  return items.reduce((groups, item) => {
    const date = new Date(item.date)
      .toISOString()
      .split("T")[0];

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(item);

    return groups;
  }, {});
}

export default App;