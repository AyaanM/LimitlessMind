'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, MessageSquare, Flag, Trash2, Send, AlertCircle } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { DiscussionPost, DiscussionComment } from '@/types/database'

type SortOrder = 'newest' | 'active'

interface PostWithProfile extends DiscussionPost {
  profiles: { display_name: string | null } | null
  comment_count?: number
}

interface CommentWithProfile extends DiscussionComment {
  profiles: { display_name: string | null } | null
}

const COMMUNITY_TAGS = [
  'Housing', 'Employment', 'Mental Health', 'Autism', 'ADHD', 'Family',
  'Health Care', 'Transitions', 'Sensory', 'Self-Advocacy', 'Resources', 'Question',
]

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [comments, setComments] = useState<Record<string, CommentWithProfile[]>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [userDisplayName, setUserDisplayName] = useState<string>('Community member')
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortOrder>('newest')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
      setUserDisplayName((profile as any)?.display_name ?? 'Community member')

      const { data } = await (supabase as any)
        .from('discussion_posts')
        .select('*, profiles(display_name)')
        .is('video_id', null)
        .eq('is_hidden', false)
        .eq('status', 'visible')
        .order('created_at', { ascending: false })
      setPosts((data ?? []) as PostWithProfile[])
      setLoading(false)
    }
    load()
  }, [])

  async function loadComments(postId: string) {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('discussion_comments')
      .select('*, profiles(display_name)')
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .eq('status', 'visible')
      .order('created_at', { ascending: true })
    setComments((prev) => ({ ...prev, [postId]: (data ?? []) as CommentWithProfile[] }))
  }

  async function submitPost() {
    if (!newBody.trim() || !userId) return
    setSubmitting(true)
    const supabase = createClient()
    const { data, error } = await (supabase as any)
      .from('discussion_posts')
      .insert({
        user_id: userId,
        title: newTitle.trim() || null,
        body: newBody.trim(),
        tags: newTags,
      })
      .select('*, profiles(display_name)')
      .single()
    if (!error && data) {
      setPosts((prev) => [data as PostWithProfile, ...prev])
      setNewTitle('')
      setNewBody('')
      setNewTags([])
      setShowNewPost(false)
    }
    setSubmitting(false)
  }

  async function submitReply(postId: string) {
    if (!replyBody.trim() || !userId) return
    setSubmitting(true)
    const supabase = createClient()
    const { data, error } = await (supabase as any)
      .from('discussion_comments')
      .insert({ post_id: postId, user_id: userId, body: replyBody.trim() })
      .select('*, profiles(display_name)')
      .single()
    if (!error && data) {
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), data as CommentWithProfile] }))
      setReplyBody('')
      setReplyingTo(null)
    }
    setSubmitting(false)
  }

  async function deletePost(postId: string) {
    if (!confirm('Delete this post?')) return
    const supabase = createClient()
    await supabase.from('discussion_posts').delete().eq('id', postId).eq('user_id', userId!)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  async function reportPost(postId: string) {
    const reason = prompt('Briefly describe the issue (optional):')
    const supabase = createClient()
    await (supabase as any).from('reports').insert({ reporter_id: userId, post_id: postId, reason: reason ?? '' })
    alert('Thank you — the post has been reported for review.')
  }

  async function togglePost(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
      if (!comments[postId]) await loadComments(postId)
    }
  }

  const filtered = posts.filter((p) => {
    if (tagFilter && !p.tags.includes(tagFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.title?.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Community</h1>
        <p className="text-muted-foreground">A calm place to share, ask questions, and connect with others.</p>
      </div>

      {/* Guidelines notice */}
      <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 p-4 flex gap-3 dark:border-amber-900/30 dark:bg-amber-900/10">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Community Guidelines</p>
          <p>Keep discussion supportive, respectful, and kind. This platform is for learning and connection — not for emergencies. If you need immediate help, please call <strong>911</strong> or the Distress Line at <strong>780-482-4357</strong>.</p>
        </div>
      </div>

      {/* Controls row */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="community-search" className="sr-only">Search discussions</label>
            <input
              id="community-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions…"
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex gap-2" role="group" aria-label="Sort by">
            {(['newest', 'active'] as SortOrder[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                aria-pressed={sort === s}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  sort === s
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                )}
              >
                {s === 'newest' ? 'Newest' : 'Most Active'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> New Post
          </button>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
          <button
            onClick={() => setTagFilter(null)}
            aria-pressed={tagFilter === null}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              tagFilter === null
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-card text-muted-foreground hover:text-accent'
            )}
          >
            All topics
          </button>
          {COMMUNITY_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              aria-pressed={tagFilter === tag}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                tagFilter === tag
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-card text-muted-foreground hover:text-accent'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* New post form */}
      {showNewPost && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-card">
          <h2 className="font-semibold text-foreground">Create a new post</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-foreground mb-1">Title (optional)</label>
              <input
                id="post-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Give your post a title…"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="post-body" className="block text-sm font-medium text-foreground mb-1">Message *</label>
              <textarea
                id="post-body"
                rows={4}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Share your thoughts, question, or experience…"
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Tags (select up to 3)</p>
              <div className="flex flex-wrap gap-2">
                {COMMUNITY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNewTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : prev.length < 3 ? [...prev, tag] : prev
                    )}
                    aria-pressed={newTags.includes(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      newTags.includes(tag)
                        ? 'border-accent bg-accent-light text-accent'
                        : 'border-border bg-surface text-muted-foreground hover:text-accent'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={submitPost}
              disabled={!newBody.trim() || submitting}
              className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitting ? 'Posting…' : 'Post'}
            </button>
            <button
              onClick={() => { setShowNewPost(false); setNewBody(''); setNewTitle(''); setNewTags([]) }}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" aria-hidden="true" />
          <p className="text-muted-foreground">No posts found. Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <div key={post.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {post.profiles?.display_name ?? 'Community member'}
                      </span>
                      <span>·</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    {post.title && <p className="font-semibold text-foreground">{post.title}</p>}
                    <p className="text-sm text-foreground leading-relaxed">{post.body}</p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {post.user_id === userId ? (
                      <button
                        onClick={() => deletePost(post.id)}
                        aria-label="Delete post"
                        className="rounded p-1.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        onClick={() => reportPost(post.id)}
                        aria-label="Report post"
                        className="rounded p-1.5 text-muted-foreground hover:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Flag className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => togglePost(post.id)}
                  className="text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                >
                  {expandedPost === post.id
                    ? 'Hide replies'
                    : `Reply${comments[post.id]?.length ? ` · ${comments[post.id].length} ${comments[post.id].length === 1 ? 'reply' : 'replies'}` : ''}`
                  }
                </button>
              </div>

              {expandedPost === post.id && (
                <div className="border-t border-border bg-surface px-5 py-4 space-y-4">
                  {(comments[post.id] ?? []).map((c) => (
                    <div key={c.id} className="text-sm space-y-0.5 pl-3 border-l-2 border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {c.profiles?.display_name ?? 'Community member'}
                        </span>
                        <span>·</span>
                        <span>{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-foreground">{c.body}</p>
                    </div>
                  ))}

                  {replyingTo === post.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Write a reply…"
                        className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitReply(post.id)}
                          disabled={!replyBody.trim() || submitting}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          {submitting ? 'Posting…' : 'Post reply'}
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyBody('') }}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(post.id)}
                      className="text-xs text-muted-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                    >
                      + Add a reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
