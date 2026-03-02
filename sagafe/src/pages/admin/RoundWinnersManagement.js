import React, { useState, useEffect } from 'react';
import { eventsApi, api } from '../../lib/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const EMPTY_FORM = {
  lowest_gross_winner: '',
  lowest_gross_score: '',
  stableford_winner: '',
  stableford_points: '',
  straightest_drive_winner: '',
  straightest_drive_hole: '',
  straightest_drive_distance: '',
  close_to_pin: [{ hole: '', winner: '', distance: '' }],
  sponsors: [{ sponsor_name: '', company_name: '' }],
};

const RoundWinnersManagement = () => {
  const [leaderboardUrl, setLeaderboardUrl] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfMsg, setPdfMsg] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [existingId, setExistingId] = useState(null);
  const [loadingWinner, setLoadingWinner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  useEffect(() => { fetchEvents(); fetchLeaderboardUrl(); }, []);
  useEffect(() => { if (selectedEventId) fetchRoundWinner(selectedEventId); }, [selectedEventId]);

  const flashMsg = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter(null), 4000);
  };

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
      if (sorted.length > 0) setSelectedEventId(String(sorted[0].id));
    } catch { }
  };

  const fetchLeaderboardUrl = async () => {
    try {
      const data = await api.get('/api/leaderboard/pdf');
      setLeaderboardUrl(data?.url || null);
    } catch { setLeaderboardUrl(null); }
  };

  const fetchRoundWinner = async (eventId) => {
    setLoadingWinner(true);
    setExistingId(null);
    setForm(EMPTY_FORM);
    try {
      const data = await api.get(`/api/round-winners/${eventId}`);
      if (data) {
        setExistingId(data.id);
        setForm({
          lowest_gross_winner: data.lowest_gross_winner || '',
          lowest_gross_score: data.lowest_gross_score ?? '',
          stableford_winner: data.stableford_winner || '',
          stableford_points: data.stableford_points ?? '',
          straightest_drive_winner: data.straightest_drive_winner || '',
          straightest_drive_hole: data.straightest_drive_hole || '',
          straightest_drive_distance: data.straightest_drive_distance || '',
          close_to_pin: data.close_to_pin?.length > 0
            ? data.close_to_pin.map(r => ({ hole: r.hole || '', winner: r.winner || '', distance: r.distance || '' }))
            : [{ hole: '', winner: '', distance: '' }],
          sponsors: data.sponsors?.length > 0
            ? data.sponsors.map(s => ({ sponsor_name: s.sponsor_name || '', company_name: s.company_name || '' }))
            : [{ sponsor_name: '', company_name: '' }],
        });
      }
    } catch { }
    finally { setLoadingWinner(false); }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { flashMsg(setPdfMsg, 'error', 'Please select a PDF file.'); return; }
    setUploadingPdf(true);
    setPdfMsg(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/leaderboard/pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeaderboardUrl(data.url);
      flashMsg(setPdfMsg, 'success', 'Leaderboard PDF uploaded successfully!');
    } catch {
      flashMsg(setPdfMsg, 'error', 'Upload failed. Please try again.');
    } finally {
      setUploadingPdf(false);
      e.target.value = '';
    }
  };

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setCtpField = (i, key, value) => setForm(prev => {
    const ctp = [...prev.close_to_pin];
    ctp[i] = { ...ctp[i], [key]: value };
    return { ...prev, close_to_pin: ctp };
  });
  const addCtp = () => setForm(prev => ({ ...prev, close_to_pin: [...prev.close_to_pin, { hole: '', winner: '', distance: '' }] }));
  const removeCtp = (i) => setForm(prev => ({ ...prev, close_to_pin: prev.close_to_pin.filter((_, idx) => idx !== i) }));

  const setSponsorField = (i, key, value) => setForm(prev => {
    const sponsors = [...prev.sponsors];
    sponsors[i] = { ...sponsors[i], [key]: value };
    return { ...prev, sponsors };
  });
  const addSponsor = () => setForm(prev => ({ ...prev, sponsors: [...prev.sponsors, { sponsor_name: '', company_name: '' }] }));
  const removeSponsor = (i) => setForm(prev => ({ ...prev, sponsors: prev.sponsors.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!selectedEventId) return;
    setSaving(true);
    setFormMsg(null);
    const payload = {
      event_id: parseInt(selectedEventId),
      lowest_gross_winner: form.lowest_gross_winner || null,
      lowest_gross_score: form.lowest_gross_score !== '' ? parseFloat(form.lowest_gross_score) : null,
      stableford_winner: form.stableford_winner || null,
      stableford_points: form.stableford_points !== '' ? parseFloat(form.stableford_points) : null,
      straightest_drive_winner: form.straightest_drive_winner || null,
      straightest_drive_hole: form.straightest_drive_hole || null,
      straightest_drive_distance: form.straightest_drive_distance || null,
      close_to_pin: form.close_to_pin.filter(r => r.hole && r.winner),
      sponsors: form.sponsors.filter(s => s.company_name || s.sponsor_name),
    };
    try {
      if (existingId) {
        await api.put(`/api/admin/round-winners/${existingId}`, payload);
        flashMsg(setFormMsg, 'success', 'Results updated successfully!');
      } else {
        const created = await api.post('/api/admin/round-winners', payload);
        setExistingId(created.id);
        flashMsg(setFormMsg, 'success', 'Results saved successfully!');
      }
    } catch (err) {
      flashMsg(setFormMsg, 'error', err.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!existingId || !window.confirm('Delete all results for this event?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/round-winners/${existingId}`);
      setExistingId(null);
      setForm(EMPTY_FORM);
      flashMsg(setFormMsg, 'success', 'Results deleted.');
    } catch (err) {
      flashMsg(setFormMsg, 'error', err.message || 'Delete failed.');
    } finally { setDeleting(false); }
  };

  return (
    <div className="rw-root">
      <h2 className="admin-section-title">Leaderboard &amp; Round Winners</h2>

      {/* PDF Card */}
      <div className="rw-card">
        <div className="rw-card-head">
          <span className="rw-card-icon">📄</span>
          <h3>SAGA Leaderboard PDF</h3>
        </div>
        {leaderboardUrl && (
          <div className="rw-pdf-current">
            <span>Current file:</span>
            <a href={`${API_URL}${leaderboardUrl}`} target="_blank" rel="noopener noreferrer">View Leaderboard ↗</a>
          </div>
        )}
        <label className={`rw-upload-btn ${uploadingPdf ? 'disabled' : ''}`}>
          {uploadingPdf ? 'Uploading…' : leaderboardUrl ? '↑ Replace PDF' : '↑ Upload Leaderboard PDF'}
          <input type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={uploadingPdf} style={{ display: 'none' }} />
        </label>
        {pdfMsg && <p className={`rw-msg ${pdfMsg.type}`}>{pdfMsg.text}</p>}
      </div>

      {/* Round Winners Card */}
      <div className="rw-card">
        <div className="rw-card-head">
          <span className="rw-card-icon">🏆</span>
          <h3>Monthly Round Winners</h3>
          {existingId && <span className="rw-badge">Editing existing record</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Select Event</label>
          <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="event-selector">
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.golf_course} — {new Date(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        {loadingWinner ? (
          <p className="rw-loading">Loading…</p>
        ) : (
          <>
            <fieldset className="rw-fieldset">
              <legend>⭐ Event Sponsors</legend>
              {form.sponsors.map((s, i) => (
                <div key={i} className="rw-sponsor-row">
                  <div className="form-group rw-sponsor-company">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={s.company_name}
                      onChange={e => setSponsorField(i, 'company_name', e.target.value)}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="form-group rw-sponsor-person">
                    <label>Sponsor Name (person)</label>
                    <input
                      type="text"
                      value={s.sponsor_name}
                      onChange={e => setSponsorField(i, 'sponsor_name', e.target.value)}
                      placeholder="e.g. John Smith"
                    />
                  </div>
                  {form.sponsors.length > 1 && (
                    <button className="rw-rm-btn" onClick={() => removeSponsor(i)} title="Remove sponsor">✕</button>
                  )}
                </div>
              ))}
              <button className="rw-add-btn" onClick={addSponsor}>+ Add Another Sponsor</button>
              {form.sponsors.some(s => s.company_name) && (
                <div className="rw-preview" style={{ marginTop: '0.75rem' }}>
                  <strong>Preview:</strong>
                  {form.sponsors.filter(s => s.company_name).map((s, i) => (
                    <div key={i} style={{ marginTop: '0.25rem' }}>
                      ⭐ "Big thank you to our Sponsor <strong>{s.company_name}</strong>{s.sponsor_name && <> (Courtesy <strong>{s.sponsor_name}</strong>)</>}!!!" ⭐
                    </div>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="rw-fieldset">
              <legend>🏌️ Lowest Gross Score</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Winner Name</label>
                  <input type="text" value={form.lowest_gross_winner} onChange={e => setField('lowest_gross_winner', e.target.value)} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Gross Score</label>
                  <input type="number" value={form.lowest_gross_score} onChange={e => setField('lowest_gross_score', e.target.value)} placeholder="e.g. 72" />
                </div>
              </div>
            </fieldset>

            <fieldset className="rw-fieldset">
              <legend>📊 Highest Stableford Points</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Winner Name</label>
                  <input type="text" value={form.stableford_winner} onChange={e => setField('stableford_winner', e.target.value)} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Points</label>
                  <input type="number" value={form.stableford_points} onChange={e => setField('stableford_points', e.target.value)} placeholder="e.g. 38" />
                </div>
              </div>
            </fieldset>

            <fieldset className="rw-fieldset">
              <legend>🎯 Straightest Drive</legend>
              <div className="rw-ctp-row">
              <div className="form-group">
                  <label>Hole</label>
                  <input type="number" value={form.straightest_drive_hole} onChange={e => setField('straightest_drive_hole', e.target.value)} placeholder="7" min="1" max="18" />
                </div>
                <div className="form-group">
                  <label>Winner Name</label>
                  <input type="text" value={form.straightest_drive_winner} onChange={e => setField('straightest_drive_winner', e.target.value)} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Distance</label>
                  <input type="text" value={form.straightest_drive_distance} onChange={e => setField('straightest_drive_distance', e.target.value)} placeholder="e.g. 2 ft" />
                </div>
              </div>
            </fieldset>

            <fieldset className="rw-fieldset">
              <legend>📍 Close to Pin</legend>
              {form.close_to_pin.map((row, i) => (
                <div className="rw-ctp-row" key={i}>
                  <div className="form-group">
                    <label>Hole</label>
                    <input type="number" value={row.hole} onChange={e => setCtpField(i, 'hole', e.target.value)} placeholder="4" min="1" max="18" />
                  </div>
                  <div className="form-group rw-ctp-name">
                    <label>Winner Name</label>
                    <input type="text" value={row.winner} onChange={e => setCtpField(i, 'winner', e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="form-group">
                    <label>Distance</label>
                    <input type="text" value={row.distance} onChange={e => setCtpField(i, 'distance', e.target.value)} placeholder="e.g. 4.5" />
                  </div>
                  {form.close_to_pin.length > 1 && (
                    <button className="rw-rm-btn" onClick={() => removeCtp(i)} title="Remove row">✕</button>
                  )}
                </div>
              ))}
              <button className="rw-add-btn" onClick={addCtp}>+ Add Another Hole</button>
            </fieldset>

            {formMsg && <p className={`rw-msg ${formMsg.type}`}>{formMsg.text}</p>}

            <div className="rw-actions">
              <button className="btn-primary" onClick={handleSave} disabled={saving || !selectedEventId}>
                {saving ? 'Saving…' : existingId ? 'Update Results' : 'Save Results'}
              </button>
              {existingId && (
                <button className="rw-del-btn" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete Results'}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .rw-root { max-width: 820px; }
        .rw-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:1.75rem; margin-bottom:1.5rem; box-shadow:0 1px 6px rgba(0,0,0,0.05); }
        .rw-card-head { display:flex; align-items:center; gap:0.6rem; margin-bottom:1.25rem; }
        .rw-card-icon { font-size:1.2rem; }
        .rw-card-head h3 { font-size:1.05rem; font-weight:700; color:#111827; margin:0; flex:1; }
        .rw-badge { font-size:0.7rem; font-weight:700; background:#d1fae5; color:#065f46; padding:0.2rem 0.65rem; border-radius:20px; }
        .rw-fieldset { border:1px solid #e5e7eb; border-radius:10px; padding:1rem 1.25rem 1.25rem; margin-bottom:1rem; }
        .rw-fieldset legend { font-size:0.85rem; font-weight:700; color:#374151; padding:0 0.5rem; }
        .rw-ctp-row { display:flex; gap:0.75rem; align-items:flex-end; margin-bottom:0.75rem; flex-wrap:wrap; }
        .rw-ctp-row .form-group { margin-bottom:0; }
        .rw-ctp-name { flex:2; }
        .rw-sponsor-row { display:flex; gap:0.75rem; align-items:flex-end; margin-bottom:0.75rem; flex-wrap:wrap; }
        .rw-sponsor-row .form-group { margin-bottom:0; }
        .rw-sponsor-company { flex:2; }
        .rw-sponsor-person { flex:2; }
        .rw-rm-btn { background:none; border:1px solid #fca5a5; color:#dc2626; border-radius:6px; width:32px; height:32px; cursor:pointer; font-size:0.8rem; flex-shrink:0; align-self:flex-end; }
        .rw-rm-btn:hover { background:#fef2f2; }
        .rw-add-btn { background:none; border:1px dashed #d1d5db; border-radius:8px; padding:0.4rem 0.875rem; font-size:0.83rem; color:#6b7280; cursor:pointer; margin-top:0.25rem; }
        .rw-add-btn:hover { border-color:#9ca3af; color:#374151; background:#f9fafb; }
        .rw-pdf-current { display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:#6b7280; margin-bottom:0.75rem; }
        .rw-pdf-current a { color:#059669; font-weight:600; text-decoration:none; }
        .rw-pdf-current a:hover { text-decoration:underline; }
        .rw-upload-btn { display:inline-block; padding:0.55rem 1.25rem; background:#059669; color:white; border-radius:9px; font-weight:700; font-size:0.875rem; cursor:pointer; }
        .rw-upload-btn:hover:not(.disabled) { background:#047857; }
        .rw-upload-btn.disabled { opacity:0.6; cursor:not-allowed; }
        .rw-msg { margin-top:0.75rem; font-size:0.875rem; font-weight:500; padding:0.6rem 0.875rem; border-radius:8px; }
        .rw-msg.success { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; }
        .rw-msg.error { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }
        .rw-loading { color:#6b7280; font-size:0.9rem; text-align:center; padding:1rem; }
        .rw-preview { font-size:0.83rem; color:#6b7280; margin-top:0.625rem; padding:0.5rem 0.75rem; background:#fefce8; border:1px solid #fef08a; border-radius:6px; }
        .rw-preview strong { color:#92400e; }
        .rw-actions { display:flex; gap:0.75rem; margin-top:1.5rem; flex-wrap:wrap; }
        .rw-del-btn { padding:0.6rem 1.25rem; background:#fef2f2; color:#dc2626; border:1px solid #fca5a5; border-radius:9px; font-weight:700; font-size:0.875rem; cursor:pointer; }
        .rw-del-btn:hover:not(:disabled) { background:#fee2e2; }
        .rw-del-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>
    </div>
  );
};

export default RoundWinnersManagement;