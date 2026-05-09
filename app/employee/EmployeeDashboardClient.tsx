'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_ICONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Video, ContactCard } from '@/types/database'
import type { VideoCategory } from '@/types/database'

interface Props {
  initialVideos: Video[]
  initialContacts: ContactCard[]
  progressSummary: Record<string, { started: number; completed: number }>
}

type ActiveTab = 'videos' | 'contacts' | 'progress'

const EMPTY_VIDEO = {
  vimeo_id: '',
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
}

export function EmployeeDashboardClient({ initialVideos, initialContacts, progressSummary }: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('videos')
  const [videos, setVideos] = useState(initialVideos)
  const [contacts, setContacts] = useState(initialContacts)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [videoForm, setVideoForm] = useState(EMPTY_VIDEO)
  const [savingVideo, setSavingVideo] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function openNewVideo() {
    setVideoForm(EMPTY_VIDEO)
    setEditingVideo(null)
    setShowVideoForm(true)
  }

  function openEditVideo(video: Video) {
    setVideoForm({
      vimeo_id: video.vimeo_id,
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
    })
    setEditingVideo(video)
    setShowVideoForm(true)
  }

  async function saveVideo() {
    setError('')
    if (!videoForm.vimeo_id.trim() || !videoForm.title.trim()) {
      setError('Vimeo ID and title are required.')
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

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'videos', label: `Videos (${videos.length})` },
    { id: 'contacts', label: `Contacts (${contacts.length})` },
    { id: 'progress', label: 'User Progress' },
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

      {/* Tabs */}
      <div className="flex border-b border-border" role="tablist">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'px-5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
              activeTab === id
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Videos tab */}
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

          {/* Video form */}
          {showVideoForm && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">{editingVideo ? 'Edit video' : 'Add new video'}</h2>
                <button onClick={() => setShowVideoForm(false)} aria-label="Cancel">
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="vimeo-id" className="block text-sm font-medium text-foreground">Vimeo ID *</label>
                  <input id="vimeo-id" type="text" value={videoForm.vimeo_id} onChange={(e) => setVideoForm((f) => ({ ...f, vimeo_id: e.target.value }))}
                    placeholder="e.g. 76979871"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="title" className="block text-sm font-medium text-foreground">Title *</label>
                  <input id="title" type="text" value={videoForm.title} onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
                  <textarea id="description" rows={3} value={videoForm.description} onChange={(e) => setVideoForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="category" className="block text-sm font-medium text-foreground">Category</label>
                  <select id="category" value={videoForm.category} onChange={(e) => setVideoForm((f) => ({ ...f, category: e.target.value as VideoCategory }))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                    {(['Housing','Employment','Mental Health','Relationships','Identity'] as VideoCategory[]).map((c) => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="speaker" className="block text-sm font-medium text-foreground">Speaker</label>
                  <input id="speaker" type="text" value={videoForm.speaker} onChange={(e) => setVideoForm((f) => ({ ...f, speaker: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="duration" className="block text-sm font-medium text-foreground">Duration (seconds)</label>
                  <input id="duration" type="number" min={0} value={videoForm.duration_seconds} onChange={(e) => setVideoForm((f) => ({ ...f, duration_seconds: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="tags" className="block text-sm font-medium text-foreground">Tags (comma-separated)</label>
                  <input id="tags" type="text" value={videoForm.tags.join(', ')}
                    onChange={(e) => setVideoForm((f) => ({ ...f, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                    placeholder="e.g. housing, adults, Alberta"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { key: 'is_premium', label: 'Premium' },
                  { key: 'is_featured', label: 'Featured' },
                  { key: 'is_autism_edmonton_pick', label: 'AE Pick' },
                  { key: 'is_new_this_month', label: 'New this month' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input type="checkbox" checked={videoForm[key as keyof typeof videoForm] as boolean}
                      onChange={(e) => setVideoForm((f) => ({ ...f, [key]: e.target.checked }))}
                      className="rounded border-border focus:ring-accent" />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={saveVideo} disabled={savingVideo}
                  className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {savingVideo ? 'Saving…' : 'Save video'}
                </button>
                <button onClick={() => setShowVideoForm(false)}
                  className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Videos table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Title</th>
                  <th className="px-4 py-3 font-medium text-foreground">Category</th>
                  <th className="px-4 py-3 font-medium text-foreground">Vimeo ID</th>
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
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{video.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{video.vimeo_id}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${video.is_premium ? 'bg-premium-light text-premium' : 'bg-sage-light text-sage'}`}>
                        {video.is_premium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditVideo(video)} aria-label={`Edit ${video.title}`}
                          className="rounded p-1 text-muted-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button onClick={() => deleteVideo(video.id)} disabled={deletingId === video.id} aria-label={`Delete ${video.title}`}
                          className="rounded p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-40">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {videos.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No videos yet. Click &quot;Add video&quot; to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contacts tab */}
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
                      <button
                        onClick={() => toggleContactVisibility(card.id, card.is_visible)}
                        aria-label={card.is_visible ? 'Hide contact' : 'Show contact'}
                        className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {card.is_visible
                          ? <Eye className="h-4 w-4 text-sage" aria-hidden="true" />
                          : <EyeOff className="h-4 w-4" aria-hidden="true" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No contact cards yet. Add them via SQL seed or Supabase dashboard.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progress tab */}
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
                      <td className="max-w-xs px-4 py-3">
                        <p className="truncate font-medium text-foreground">{video.title}</p>
                      </td>
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
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No videos to show progress for.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
