import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    domain: 'Web Development',
    position: 'Member',
    srn: '',
    email: '',
    linkedin_url: '',
    github_url: '',
    branch: 'CSE',
    semester: 1,
    bio: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas conversion failed'));
            },
            'image/webp',
            0.8
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let photo_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (formData.name || 'default');

      if (imageFile) {
        const webpBlob = await convertToWebP(imageFile);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;

        const { error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(fileName, webpBlob, { contentType: 'image/webp' });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName);

        photo_url = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('members').insert([
        { ...formData, photo_url, status: 'pending' }
      ]);

      if (error) throw error;

      setMessage('Successfully submitted! Your profile is pending approval.');
      setFormData({
        name: '', domain: 'Web Development', position: 'Member',
        srn: '', email: '', linkedin_url: '', github_url: '',
        branch: 'CSE', semester: 1, bio: ''
      });
      setImageFile(null);
      setPreviewUrl('');
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Form Section */}
      <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
        <h1 className="text-2xl font-bold mb-6 text-purple-400">Member Onboarding</h1>
        {message && (
          <div className="mb-4 p-3 bg-purple-900/50 border border-purple-500 rounded text-sm">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-neutral-400 mb-1">Full Name</label>
            <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Domain</label>
              <select name="domain" value={formData.domain} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white">
                {['Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Position</label>
              <select name="position" value={formData.position} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white">
                {['Head', 'Vice-Head', 'Core Member', 'Member'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">SRN</label>
              <input name="srn" value={formData.srn} onChange={handleInputChange} placeholder="PES1UG23CS001" required className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Branch</label>
              <input name="branch" value={formData.branch} onChange={handleInputChange} required className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Semester</label>
              <select name="semester" value={formData.semester} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">LinkedIn URL</label>
              <input name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">GitHub URL</label>
              <input name="github_url" value={formData.github_url} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase text-neutral-400 mb-1">Bio (~150-200 chars)</label>
            <textarea name="bio" maxLength={200} value={formData.bio} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
          </div>
          <div>
            <label className="block text-xs uppercase text-neutral-400 mb-1">Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 font-semibold rounded hover:bg-purple-500 transition">
            {loading ? 'Converting & Submitting...' : 'Submit Profile'}
          </button>
        </form>
      </div>

      {/* Live Preview Section */}
      <div className="flex flex-col items-center justify-center p-8 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">Live Card Preview</h2>
        <div className="w-80 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
          <img
            src={previewUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'placeholder'}`}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-purple-500 mb-4"
          />
          <h3 className="text-lg font-bold text-white">{formData.name || 'Your Name'}</h3>
          <span className="inline-block px-3 py-1 bg-purple-950 text-purple-300 text-xs rounded-full mt-1 mb-3">
            {formData.domain} • {formData.position}
          </span>
          <p className="text-sm text-neutral-400 line-clamp-3 mb-4">
            {formData.bio || 'Your short description will appear here in real-time as you type...'}
          </p>
          <div className="text-xs text-neutral-500 mt-auto">
            {formData.branch} • Sem {formData.semester} • {formData.srn || 'SRN'}
          </div>
        </div>
      </div>
    </div>
  );
}