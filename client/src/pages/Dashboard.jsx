import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [selectedContact, setSelectedContact] = useState(null);
  const [aiOutput, setAiOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // New States for Deals & Activities
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newDeal, setNewDeal] = useState({ title: '', value: '', stage: 'LEAD' });
  const [newActivity, setNewActivity] = useState({ type: 'CALL', details: '' });

  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch deals and activities whenever a contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchDealsAndActivities(selectedContact.id || selectedContact._id);
    } else {
      setDeals([]);
      setActivities([]);
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    }
  };

  const fetchDealsAndActivities = async (contactId) => {
    try {
      const [dealsRes, activitiesRes] = await Promise.all([
        api.get(`/deals/contact/${contactId}`),
        api.get(`/activities/contact/${contactId}`)
      ]);
      setDeals(dealsRes.data);
      setActivities(activitiesRes.data);
    } catch (err) {
      console.error('Failed to fetch deals or activities', err);
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contacts', formData);
      setFormData({ name: '', email: '', company: '' });
      fetchContacts();
    } catch (err) {
      alert('Failed to add contact');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await api.delete(`/contacts/${id}`);
      if (selectedContact?.id === id || selectedContact?._id === id) {
        setSelectedContact(null);
        setAiOutput('');
      }
      fetchContacts();
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  // Deal Handlers
  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    try {
      await api.post('/deals', { ...newDeal, contactId: selectedContact.id || selectedContact._id });
      setNewDeal({ title: '', value: '', stage: 'LEAD' });
      fetchDealsAndActivities(selectedContact.id || selectedContact._id);
    } catch (err) {
      alert('Failed to create deal');
    }
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      await api.delete(`/deals/${dealId}`);
      fetchDealsAndActivities(selectedContact.id || selectedContact._id);
    } catch (err) {
      alert('Failed to delete deal');
    }
  };

  // Activity Handlers
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    try {
      await api.post('/activities', { ...newActivity, contactId: selectedContact.id || selectedContact._id });
      setNewActivity({ type: 'CALL', details: '' });
      fetchDealsAndActivities(selectedContact.id || selectedContact._id);
    } catch (err) {
      alert('Failed to create activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await api.delete(`/activities/${activityId}`);
      fetchDealsAndActivities(selectedContact.id || selectedContact._id);
    } catch (err) {
      alert('Failed to delete activity');
    }
  };

  const handleAIGenerate = async (action) => {
    if (!selectedContact) return;
    setLoading(true);
    setAiOutput('');
    setCopied(false);
    try {
      const res = await api.post('/ai/generate', {
        contactId: selectedContact.id || selectedContact._id,
        action: action
      });
      setAiOutput(res.data.result);
    } catch (err) {
      setAiOutput('Error generating content. Please check server logs or API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100">
                Nexus AI CRM
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Sales Intelligence Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemini Active</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* --- DEALS & ACTIVITIES SECTIONS (Visible only when a contact is selected) --- */}
      {selectedContact && (
        <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. DEALS SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Deals for {selectedContact.name}</h3>
            
            {/* Deals List */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
              {deals.length === 0 ? (
                <p className="text-slate-400 text-sm">No deals found for this contact.</p>
              ) : (
                deals.map((deal) => (
                  <div key={deal._id || deal.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl">
                    <div>
                      <h4 className="text-white font-medium text-sm">{deal.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-emerald-400 text-xs font-semibold">${deal.value}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {deal.stage}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteDeal(deal._id || deal.id)}
                      className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Deal Form */}
            <form onSubmit={handleCreateDeal} className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-semibold text-slate-300">Add New Deal</h4>
              <input 
                type="text"
                placeholder="Deal Title"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number"
                  placeholder="Value ($)"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
                />
                <select 
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
                >
                  <option value="LEAD">LEAD</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                  <option value="CLOSED_WON">CLOSED_WON</option>
                  <option value="CLOSED_LOST">CLOSED_LOST</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-lg transition-colors"
              >
                Add Deal
              </button>
            </form>
          </div>

          {/* 2. ACTIVITIES SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Activities for {selectedContact.name}</h3>
            
            {/* Activities List */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-slate-400 text-sm">No activities recorded yet.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity._id || activity.id} className="flex items-start justify-between bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {activity.type}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {new Date(activity.createdAt || activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mt-1.5">{activity.details}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteActivity(activity._id || activity.id)}
                      className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Activity Form */}
            <form onSubmit={handleCreateActivity} className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-semibold text-slate-300">Add New Activity</h4>
              <select 
                value={newActivity.type}
                onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
              >
                <option value="CALL">CALL</option>
                <option value="EMAIL">EMAIL</option>
                <option value="MEETING">MEETING</option>
                <option value="NOTE">NOTE</option>
              </select>
              <textarea 
                placeholder="Activity details..."
                value={newActivity.details}
                onChange={(e) => setNewActivity({ ...newActivity, details: e.target.value })}
                required
                rows="2"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600 resize-none"
              />
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-lg transition-colors"
              >
                Add Activity
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Create Contact Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span>➕</span> Create Lead Profile
              </h2>
              <form onSubmit={handleCreateContact} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm shadow-lg transition active:scale-[0.99]"
                >
                  Save Lead Profile
                </button>
              </form>
            </div>

            {/* Contacts Directory */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <span>📇</span> Active Pipeline Contacts
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                    {contacts.length}
                  </span>
                </h2>
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-500">No leads added yet. Create your first contact above.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-115 overflow-y-auto pr-1">
                  {contacts.map((c) => {
                    const contactId = c.id || c._id;
                    const isSelected = selectedContact?.id === contactId || selectedContact?._id === contactId;
                    return (
                      <div
                        key={contactId}
                        onClick={() => setSelectedContact(c)}
                        className={`p-4 rounded-xl cursor-pointer border transition flex items-center justify-between group ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isSelected 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-200 text-sm">
                              {c.name}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              {c.email} {c.company && <span className="text-slate-500">· {c.company}</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md font-semibold">
                              SELECTED
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contactId);
                            }}
                            className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (AI Copilot) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></div>
                  <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                    AI Sales Copilot
                  </h2>
                </div>
                {selectedContact && (
                  <span className="text-xs text-slate-400 font-mono">
                    Target: <strong className="text-indigo-400">{selectedContact.name}</strong>
                  </span>
                )}
              </div>

              {!selectedContact ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-xl">
                    👈
                  </div>
                  <p className="text-sm text-slate-400 max-w-60 mx-auto">
                    Select a contact from directory to generate contextual outreach or summaries.
                  </p>
                </div>
              ) : (
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                   <button
                     onClick={() => handleAIGenerate('draft_email')}
                     disabled={loading}
                     className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                   >
                     <span className="text-base">✉</span>
                     <span>Draft Email</span>
                   </button>
                   
                   <button
                     onClick={() => handleAIGenerate('summarize')}
                     disabled={loading}
                     className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                   >
                     <span className="text-base">📊</span>
                     <span>Summarize History</span>
                   </button>
                 </div>

                  {loading && (
                    <div className="p-8 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center space-y-3">
                      <div className="inline-block w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-purple-300 font-medium animate-pulse">
                        Gemini is generating response...
                      </p>
                    </div>
                  )}

                  {aiOutput && !loading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Generated Insights</span>
                        <button
                          onClick={handleCopy}
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition text-[11px] font-medium cursor-pointer"
                        >
                          {copied ? '✓ Copied' : '📋 Copy Output'}
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed max-h-85 overflow-y-auto whitespace-pre-wrap">
                        {aiOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}