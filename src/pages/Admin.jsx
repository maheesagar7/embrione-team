import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingMembers, setPendingMembers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@embrione.pes.edu' && password === 'EmbrioneAdmin@2026') {
      setIsLoggedIn(true);
      fetchData();
    } else {
      alert('Invalid universal admin credentials!');
    }
  };

  const fetchData = async () => {
    const { data } = await supabase.from('members').select('*');
    if (data) {
      setPendingMembers(data.filter((m) => m.status === 'pending'));
      setStats({
        total: data.length,
        pending: data.filter((m) => m.status === 'pending').length,
        approved: data.filter((m) => m.status === 'approved').length,
      });
    }
  };

  const updateStatus = async (id, status) => {
    await supabase.from('members').update({ status }).eq('id', id);
    fetchData();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl w-full max-w-md space-y-4">
          <h1 className="text-xl font-bold text-white mb-2">Admin Portal Login</h1>
          <div>
            <label className="block text-xs uppercase text-neutral-400 mb-1">Admin Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
          </div>
          <div>
            <label className="block text-xs uppercase text-neutral-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
          </div>
          <button type="submit" className="w-full py-3 bg-purple-600 font-semibold rounded hover:bg-purple-500 transition">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-purple-400">Admin Moderation Dashboard</h1>
        
        {/* Counters */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
            <div className="text-neutral-400 text-sm">Total Submissions</div>
            <div className="text-3xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
            <div className="text-neutral-400 text-sm">Pending Review</div>
            <div className="text-3xl font-bold text-amber-400 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
            <div className="text-neutral-400 text-sm">Approved</div>
            <div className="text-3xl font-bold text-emerald-400 mt-1">{stats.approved}</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Pending Profiles</h2>
        <div className="space-y-4">
          {pendingMembers.length === 0 ? (
            <p className="text-neutral-500">No pending profiles to review.</p>
          ) : (
            pendingMembers.map((member) => (
              <div key={member.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={member.photo_url} alt="" className="w-14 h-14 rounded-full object-cover border border-purple-500" />
                  <div>
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-sm text-purple-400">{member.domain} • {member.position}</p>
                    <p className="text-xs text-neutral-400 mt-1">{member.bio}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => updateStatus(member.id, 'approved')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold rounded">Approve</button>
                  <button onClick={() => updateStatus(member.id, 'rejected')} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-sm font-semibold rounded">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}