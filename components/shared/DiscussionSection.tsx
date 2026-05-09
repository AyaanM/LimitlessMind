'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Trash2, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { DiscussionPost, DiscussionComment } from '@/types/database'

interface PostWithProfile extends DiscussionPost {
  profiles: { display_name: string | null } | null
}

interface CommentWithProfile extends DiscussionComment {
  profiles: { display_name: string | null } | null
}

interface DiscussionSectionProps {
  videoId: string
  userId: string
  userDisplayName: string
}

export function DiscussionSection({ videoId, userId, userDisplayName }: DiscussionSectionProps) {
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [comments, setComments] = useState<Record<string, CommentWithProfile[]>>({})
  const [loading, setLoading] = useState(true)
  const [newBody, setNewBody] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('discussion_posts')
        .select('*, profiles(display_name)')
        .eq('video_id', videoId)
        .eq('is_hidden', false)
        .eq('status', 'visible')
        .order('created_at', { ascending: false })
      setPosts((data ?? []) as PostWithProfile[])
      setLoading(false)
    }
    load()
  }, [videoId])

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

  async function togglePost(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
      if (!comments[postId]) await loadComments(postId)
    }
  }

  async function submitPost() {
    if (!newBody.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { data, error } = await (supabase as any)
      .from('discussion_posts')
      .insert({ user_id: userId, video_id: videoId, body: newBody.trim() })
      .select('*, profiles(display_name)')
      .single()
    if (!error && data) {
      setPosts((prev) => [data as PostWithProfile, ...prev])
      setNewBody('')
    }
    setSubmitting(false)
  }

  async function submitReply(postId: string) {
    if (!replyBody.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { data, error } = await (supabase as any)
      .from('discussion_comments')
      .insert({ post_id: postId, user_id: userId, body: replyBody.trim() })
      .select('*, profiles(display_name)')
      .single()
    if (!error && data) {
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), data as CommentWithProfile],
      }))
      setReplyBody('')
      setReplyingTo(null)
    }
    setSubmitting(false)
  }

  async function deletePost(postId: string) {
    if (!confirm('Delete this comment? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('discussion_posts').delete().eq('id', postId).eq('user_id', userId)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  async function reportPost(postId: string) {
    const reason = prompt('Briefly describe the issue (optional):')
    const supabase = createClient()
    await (supabase as any).from('reports').insert({ reporter_id: userId, post_id: postId, reason: reason ?? '' })
    alert('Thank you — the post has been reported for review.')
  }

  if (loading) {
    return <div className="rounded-xl border border-border bg-card p-5 animate-pulse h-24" />
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" aria-hidden="true" />
          Discussion{posts.length > 0 ? ` (${posts.length})` : ''}
        </h2>
      </div>

      <div className="p-5 space-y-5">
        {/* New comment box */}
        <div className="space-y-2">
          <label htmlFor="new-comment" className="text-xs font-medium text-muted-foreground">
            Share your thoughts
          </label>
          <textarea
            id="new-comment"
            rows={3}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="What did you think of this video?"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex justify-end">
            <button
              onClick={submitPost}
              disabled={!newBody.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>

        {/* Posts list */}
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="rounded-lg border border-border bg-surface p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">
                        {post.profiles?.display_name ?? 'Community member'}
                      </span>
                      <span>·</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground">{post.body}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {post.user_id === userId && (
                      <button
                        onClick={() => deletePost(post.id)}
                        aria-label="Delete comment"
                        className="rounded p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {post.user_id !== userId && (
                      <button
                        onClick={() => reportPost(post.id)}
                        aria-label="Report comment"
                        className="rounded p-1 text-muted-foreground hover:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Replies toggle */}
                <button
                  onClick={() => togglePost(post.id)}
                  className="text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                >
                  {expandedPost === post.id ? 'Hide replies' : `Reply${comments[post.id]?.length ? ` (${comments[post.id].length})` : ''}`}
                </button>

                {expandedPost === post.id && (
                  <div className="space-y-3 pl-4 border-l-2 border-border">
                    {(comments[post.id] ?? []).map((c) => (
                      <div key={c.id} className="text-sm space-y-0.5">
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

                    {/* Reply input */}
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
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

        <p className="text-xs text-muted-foreground text-center border-t border-border pt-3">
          Keep discussion supportive and respectful. This platform is not for emergencies — call 911 if you need immediate help.
        </p>
      </div>
    </div>
  )
}
