'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Flag, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_ICONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Video, ContactCard, Speaker, Collection, Playlist, ExternalOrganization } from '@/types/database'
import type { VideoCategory } from '@/types/database'

interface Props {
  initialVideos: Video[]
  initialContacts: ContactCard[]
  progressSummary: Record<string, { started: number; completed: number }>
  initialSpeakers: Speaker[]
  initialCollections: Collection[]
  initialPlaylists: Playlist[]
  initialOrgs: ExternalOrganization[]
}

type ActiveTab = 'videos' | 'contacts' | 'progress' | 'speakers' | 'collections' | 'playlists' | 'resources' | 'moderation'

const EMPTY_VIDEO = {
  youtube_id: '',
  title: '',
  description: '',
  category: 'Housing' as VideoCategory,
  speaker: '',
  duration_seconds: 0,
  tags: [] as string[],
  is_premium: false,
  is_featured: false,
  is_autism_edmonton_pick: false,
  is_new_this_month: false,
  certificate_eligible: false,
  estimated_learning_minutes: 0,
}

const EMPTY_SPEAKER = {
  name: '',
  bio: '',
  credentials: '',
  organization: '',
  website_url: '',
  contact_url: '',
  topic_specialties: [] as string[],
}

export function EmployeeDashboardClient({
  initialVideos,
  initialContacts,
  progressSummary,
  initialSpeakers,
  initialCollections,
  initialPlaylists,
  initialOrgs,
}: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('videos')
  const [videos, setVideos] = useState(initialVideos)
  const [contacts, setContacts] = useState(initialContacts)
  const [speakers, setSpeakers] = useState(initialSpeakers)
  const [collections, setCollections] = useState(initialCollections)
  const [playlists, setPlaylists] = useState(initialPlaylists)
  const [orgs, setOrgs] = useState(initialOrgs)
  const [reportedPosts, setReportedPosts] = useState<any[]>([])

  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [videoForm, setVideoForm] = useState(EMPTY_VIDEO)
  const [savingVideo, setSavingVideo] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [showSpeakerForm, setShowSpeakerForm] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null)
  const [speakerForm, setSpeakerForm] = useState(EMPTY_SPEAKER)
  const [savingSpeaker, setSavingSpeaker] = useState(false)

  function openNewVideo() {
    setVideoForm(EMPTY_VIDEO)
    setEditingVideo(null)
    setShowVideoForm(true)
  }

  function openEditVideo(video: Video) {
    setVideoForm({
      youtube_id: video.youtube_id,
      title: video.title,
      description: video.description ?? '',
      category: video.category,
      speaker: video.speaker ?? '',
      duration_seconds: video.duration_seconds ?? 0,
      tags: video.tags,
      is_premium: video.is_premium,
      is_featured: video.is_featured,
      is_autism_edmonton_pick: video.is_autism_edmonton_pick,
      is_new_this_month: video.is_new_this_month,
      certificate_eligible: video.certificate_eligible,
      estimated_learning_minutes: video.estimated_learning_minutes,
    })
    setEditingVideo(video)
    setShowVideoForm(true)
  }

  async function saveVideo() {
    setError('')
    if (!videoForm.youtube_id.trim() || !videoForm.title.trim()) {
      setError('YouTube ID and title are required.')
      return
    }
    setSavingVideo(true)
    const supabase = createClient()

    if (editingVideo) {
      const { data, error: e } = await (supabase.from('videos') as any)
        .update({ ...videoForm })
        .eq('id', editingVideo.id)
        .select()
        .single()
      if (e) { setError(e.message); setSavingVideo(false); return }
      setVideos((prev) => prev.map((v) => v.id === editingVideo.id ? data as Video : v))
    } else {
      const { data, error: e } = await (supabase.from('videos') as any)
        .insert({ ...videoForm })
        .select()
        .single()
      if (e) { setError(e.message); setSavingVideo(false); return }
      setVideos((prev) => [data as Video, ...prev])
    }

    setSavingVideo(false)
    setShowVideoForm(false)
  }

  async function deleteVideo(id: string) {
    if (!confirm('Delete this video? This cannot be undone.')) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('videos').delete().eq('id', id)
    setVideos((prev) => prev.filter((v) => v.id !== id))
    setDeletingId(null)
  }

  async function toggleContactVisibility(id: string, visible: boolean) {
    const supabase = createClient()
    await (supabase.from('contact_cards') as any).update({ is_visible: !visible }).eq('id', id)
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, is_visible: !visible } : c))
  }

  function openNewSpeaker() {
    setSpeakerForm(EMPTY_SPEAKER)
    setEditingSpeaker(null)
    setShowSpeakerForm(true)
  }

  function openEditSpeaker(s: Speaker) {
    setSpeakerForm({
      name: s.name,
      bio: s.bio ?? '',
      credentials: s.credentials ?? '',
      organization: s.organization ?? '',
      website_url: s.website_url ?? '',
      contact_url: s.contact_url ?? '',
      topic_specialties: s.topic_specialties,
    })
    setEditingSpeaker(s)
    setShowSpeakerForm(true)
  }

  async function saveSpeaker() {
    if (!speakerForm.name.trim()) return
    setSavingSpeaker(true)
    const supabase = createClient()
    const payload = {
      ...speakerForm,
      topic_specialties: speakerForm.topic_specialties,
    }
    if (editingSpeaker) {
      const { data, error: e } = await (supabase as any)
        .from('speakers').update(payload).eq('id', editingSpeaker.id).select().single()
      if (!e) setSpeakers((prev) => prev.map((s) => s.id === editingSpeaker.id ? data as Speaker : s))
    } else {
      const { data, error: e } = await (supabase as any)
        .from('speakers').insert(payload).select().single()
      if (!e) setSpeakers((prev) => [data as Speaker, ...prev])
    }
    setSavingSpeaker(false)
    setShowSpeakerForm(false)
  }

  async function deleteSpeaker(id: string) {
    if (!confirm('Delete this speaker?')) return
    const supabase = createClient()
    await (supabase as any).from('speakers').delete().eq('id', id)
    setSpeakers((prev) => prev.filter((s) => s.id !== id))
  }

  async function loadReportedPosts() {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('discussion_posts')
      .select('*, profiles(display_name)')
      .gt('reported_count', 0)
      .order('reported_count', { ascending: false })
    setReportedPosts(data ?? [])
  }

  async function hidePost(postId: string) {
    const supabase = createClient()
    await (supabase as any).from('discussion_posts').update({ is_hidden: true }).eq('id', postId)
    setReportedPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  async function toggleOrgVisibility(id: string, visible: boolean) {
    const supabase = createClient()
    await (supabase as any).from('external_organizations').update({ is_visible: !visible }).eq('id', id)
    setOrgs((prev) => prev.map((o) => o.id === id ? { ...o, is_visible: !visible } : o))
  }

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'videos',      label: `Videos (${videos.length})` },
    { id: 'speakers',    label: `Speakers (${speakers.length})` },
    { id: 'collections', label: `Collections (${collections.length})` },
    { id: 'playlists',   label: `Playlists (${playlists.length})` },
    { id: 'contacts',    label: `Contacts (${contacts.length})` },
    { id: 'resources',   label: `Resources (${orgs.length})` },
    { id: 'progress',    label: 'Progress' },
    { id: 'moderation',  label: 'Moderation' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Dashboard</h1>
          <p className="text-muted-foreground">Manage content and view user progress.</p>
        </div>
        <div className="rounded-full bg-premium-light px-4 py-2 text-sm font-medium text-premium">
          🔐 Staff access
        </div>
      </div>

      {/* Tabs — scrollable on small screens */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex border-b border-border min-w-max" role="tablist">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => { setActiveTab(id); if (id === 'moderation') loadReportedPosts() }}
              className={cn(
                'px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
                activeTab === id
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── VIDEOS TAB ── */}
      {activeTab === 'videos' && (
        <div className="space-y-5" role="tabpanel">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{videos.length} videos in library</p>
            <button
              onClick={openNewVideo}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Add video
            </button>
          </div>

          {showVideoForm && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">{editingVideo ? 'Edit video' : 'Add new video'}</h2>
                <button onClick={() => setShowVideoForm(false)} aria-label="Cancel"><X className="h-5 w-5 text-muted-foreground hover:text-foreground" /></button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="youtube-id" className="block text-sm font-medium text-foreground">YouTube ID *</label>
                  <input id="youtube-id" type="text" value={videoForm.youtube_id} onChange={(e) => setVideoForm((f) => ({ ...f, youtube_id: e.target.value }))} placeholder="e.g. dQw4w9WgXcQ" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="v-title" className="block text-sm font-medium text-foreground">Title *</label>
                  <input id="v-title" type="text" value={videoForm.title} onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="v-desc" className="block text-sm font-medium text-foreground">Description</label>
                  <textarea id="v-desc" rows={3} value={videoForm.description} onChange={(e) => setVideoForm((f) => ({ ...f, description: e.target.value }))} className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="v-cat" className="block text-sm font-medium text-foreground">Category</label>
                  <select id="v-cat" value={videoForm.category} onChange={(e) => setVideoForm((f) => ({ ...f, category: e.target.value as VideoCategory }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                    {(['Housing','Employment','Mental Health','Relationships','Identity'] as VideoCategory[]).map((c) => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="v-spk" className="block text-sm font-medium text-foreground">Speaker</label>
                  <input id="v-spk" type="text" value={videoForm.speaker} onChange={(e) => setVideoForm((f) => ({ ...f, speaker: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="v-dur" className="block text-sm font-medium text-foreground">Duration (seconds)</label>
                  <input id="v-dur" type="number" min={0} value={videoForm.duration_seconds} onChange={(e) => setVideoForm((f) => ({ ...f, duration_seconds: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="v-mins" className="block text-sm font-medium text-foreground">Est. learning minutes</label>
                  <input id="v-mins" type="number" min={0} value={videoForm.estimated_learning_minutes} onChange={(e) => setVideoForm((f) => ({ ...f, estimated_learning_minutes: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="v-tags" className="block text-sm font-medium text-foreground">Tags (comma-separated)</label>
                  <input id="v-tags" type="text" value={videoForm.tags.join(', ')} onChange={(e) => setVideoForm((f) => ({ ...f, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { key: 'is_premium', label: 'Premium' },
                  { key: 'is_featured', label: 'Featured' },
                  { key: 'is_autism_edmonton_pick', label: 'AE Pick' },
                  { key: 'is_new_this_month', label: 'New this month' },
                  { key: 'certificate_eligible', label: 'Certificate eligible' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input type="checkbox" checked={videoForm[key as keyof typeof videoForm] as boolean} onChange={(e) => setVideoForm((f) => ({ ...f, [key]: e.target.checked }))} className="rounded border-border focus:ring-accent" />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={saveVideo} disabled={savingVideo} className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {savingVideo ? 'Saving…' : 'Save video'}
                </button>
                <button onClick={() => setShowVideoForm(false)} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Cancel</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Title</th>
                  <th className="px-4 py-3 font-medium text-foreground">Category</th>
                  <th className="px-4 py-3 font-medium text-foreground">YouTube ID</th>
                  <th className="px-4 py-3 font-medium text-foreground">Plan</th>
                  <th className="px-4 py-3 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium text-foreground">{video.title}</p>
                      {video.speaker && <p className="text-xs text-muted-foreground">{video.speaker}</p>}
                      {video.certificate_eligible && <span className="text-xs text-sage">🏅 Certificate</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{video.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{video.youtube_id}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${video.is_premium ? 'bg-premium-light text-premium' : 'bg-sage-light text-sage'}`}>
                        {video.is_premium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditVideo(video)} aria-label={`Edit ${video.title}`} className="rounded p-1 text-muted-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button onClick={() => deleteVideo(video.id)} disabled={deletingId === video.id} aria-label={`Delete ${video.title}`} className="rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {videos.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No videos yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SPEAKERS TAB ── */}
      {activeTab === 'speakers' && (
        <div className="space-y-5" role="tabpanel">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{speakers.length} speakers</p>
            <button onClick={openNewSpeaker} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add speaker
            </button>
          </div>

          {showSpeakerForm && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">{editingSpeaker ? 'Edit speaker' : 'Add speaker'}</h2>
                <button onClick={() => setShowSpeakerForm(false)} aria-label="Cancel"><X className="h-5 w-5 text-muted-foreground hover:text-foreground" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: 's-name', label: 'Name *', key: 'name' as const },
                  { id: 's-cred', label: 'Credentials', key: 'credentials' as const },
                  { id: 's-org',  label: 'Organization', key: 'organization' as const },
                  { id: 's-web',  label: 'Website URL', key: 'website_url' as const },
                  { id: 's-con',  label: 'Contact URL', key: 'contact_url' as const },
                  { id: 's-spec', label: 'Specialties (comma-separated)', key: 'topic_specialties' as const },
                ].map(({ id, label, key }) => (
                  <div key={id} className="space-y-1.5">
                    <label htmlFor={id} className="block text-sm font-medium text-foreground">{label}</label>
                    <input
                      id={id}
                      type="text"
                      value={key === 'topic_specialties' ? speakerForm.topic_specialties.join(', ') : speakerForm[key]}
                      onChange={(e) => {
                        if (key === 'topic_specialties') {
                          setSpeakerForm((f) => ({ ...f, topic_specialties: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))
                        } else {
                          setSpeakerForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                      }}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                ))}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="s-bio" className="block text-sm font-medium text-foreground">Bio</label>
                  <textarea id="s-bio" rows={3} value={speakerForm.bio} onChange={(e) => setSpeakerForm((f) => ({ ...f, bio: e.target.value }))} className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={saveSpeaker} disabled={savingSpeaker || !speakerForm.name.trim()} className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {savingSpeaker ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setShowSpeakerForm(false)} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Cancel</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-foreground">Credentials</th>
                  <th className="px-4 py-3 font-medium text-foreground">Organization</th>
                  <th className="px-4 py-3 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {speakers.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.credentials ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.organization ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditSpeaker(s)} aria-label={`Edit ${s.name}`} className="rounded p-1 text-muted-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button onClick={() => deleteSpeaker(s.id)} aria-label={`Delete ${s.name}`} className="rounded p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {speakers.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No speakers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── COLLECTIONS TAB ── */}
      {activeTab === 'collections' && (
        <div className="space-y-5" role="tabpanel">
          <p className="text-sm text-muted-foreground">Manage collections via Supabase dashboard or seed.sql. {collections.length} collection{collections.length !== 1 ? 's' : ''} active.</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Title</th>
                  <th className="px-4 py-3 font-medium text-foreground">Certificate</th>
                  <th className="px-4 py-3 font-medium text-foreground">Hours</th>
                  <th className="px-4 py-3 font-medium text-foreground">Plan</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium text-foreground">{c.title}</p>
                      {c.description && <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3">{c.certificate_eligible ? <span className="text-sage">🏅 Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.estimated_hours}h</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${c.is_premium ? 'bg-premium-light text-premium' : 'bg-sage-light text-sage'}`}>{c.is_premium ? 'Premium' : 'Free'}</span></td>
                  </tr>
                ))}
                {collections.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No collections yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PLAYLISTS TAB ── */}
      {activeTab === 'playlists' && (
        <div className="space-y-5" role="tabpanel">
          <p className="text-sm text-muted-foreground">Manage playlists via Supabase dashboard or seed.sql. {playlists.length} playlist{playlists.length !== 1 ? 's' : ''} active.</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Title</th>
                  <th className="px-4 py-3 font-medium text-foreground">Plan</th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium text-foreground">{p.title}</p>
                      {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${p.is_premium ? 'bg-premium-light text-premium' : 'bg-sage-light text-sage'}`}>{p.is_premium ? 'Premium' : 'Free'}</span></td>
                  </tr>
                ))}
                {playlists.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-muted-foreground">No playlists yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CONTACTS TAB ── */}
      {activeTab === 'contacts' && (
        <div className="space-y-5" role="tabpanel">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-foreground">Organization</th>
                  <th className="px-4 py-3 font-medium text-foreground">Category</th>
                  <th className="px-4 py-3 font-medium text-foreground">Visible</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((card) => (
                  <tr key={card.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{card.name}</p>
                      {card.title && <p className="text-xs text-muted-foreground">{card.title}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{card.organization ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{card.category}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleContactVisibility(card.id, card.is_visible)} aria-label={card.is_visible ? 'Hide contact' : 'Show contact'} className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        {card.is_visible ? <Eye className="h-4 w-4 text-sage" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No contacts yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RESOURCES TAB ── */}
      {activeTab === 'resources' && (
        <div className="space-y-5" role="tabpanel">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Organization</th>
                  <th className="px-4 py-3 font-medium text-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-foreground">Location</th>
                  <th className="px-4 py-3 font-medium text-foreground">Visible</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-foreground">{org.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{org.organization_type ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{org.location ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleOrgVisibility(org.id, org.is_visible)} aria-label={org.is_visible ? 'Hide org' : 'Show org'} className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        {org.is_visible ? <Eye className="h-4 w-4 text-sage" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {orgs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No organizations yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PROGRESS TAB ── */}
      {activeTab === 'progress' && (
        <div className="space-y-5" role="tabpanel">
          <p className="text-sm text-muted-foreground">Video engagement summary across all users.</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Video</th>
                  <th className="px-4 py-3 font-medium text-foreground">Category</th>
                  <th className="px-4 py-3 font-medium text-foreground">Started</th>
                  <th className="px-4 py-3 font-medium text-foreground">Completed</th>
                  <th className="px-4 py-3 font-medium text-foreground">Completion rate</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => {
                  const stats = progressSummary[video.id] ?? { started: 0, completed: 0 }
                  const rate = stats.started > 0 ? Math.round((stats.completed / stats.started) * 100) : 0
                  return (
                    <tr key={video.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                      <td className="max-w-xs px-4 py-3"><p className="truncate font-medium text-foreground">{video.title}</p></td>
                      <td className="px-4 py-3 text-muted-foreground">{video.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{stats.started}</td>
                      <td className="px-4 py-3 text-muted-foreground">{stats.completed}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-border">
                            <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {videos.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No videos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODERATION TAB ── */}
      {activeTab === 'moderation' && (
        <div className="space-y-5" role="tabpanel">
          <p className="text-sm text-muted-foreground">
            Posts flagged by users appear here. Review and hide as needed.
          </p>

          {reportedPosts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-sage mx-auto" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No reported posts. Community is all clear.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportedPosts.map((post: any) => (
                <div key={post.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{post.profiles?.display_name ?? 'Unknown user'}</span>
                        <span>·</span>
                        <Flag className="h-3 w-3 text-amber-500" aria-hidden="true" />
                        <span className="text-amber-600">{post.reported_count} report{post.reported_count !== 1 ? 's' : ''}</span>
                      </div>
                      {post.title && <p className="font-medium text-foreground text-sm">{post.title}</p>}
                      <p className="text-sm text-foreground">{post.body}</p>
                    </div>
                    <button
                      onClick={() => hidePost(post.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                    >
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Hide post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
