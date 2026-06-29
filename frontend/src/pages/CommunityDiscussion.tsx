import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  MessageSquare, Heart, Bookmark, BookmarkCheck, ArrowRight, Share2,
  Filter, Tag, Plus, CheckCircle, HelpCircle, Send, Users
} from 'lucide-react';

interface CommentItem { userId: string; text: string; date: string; }

interface DiscussionPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  liked: boolean;
  bookmarked: boolean;
  comments: CommentItem[];
  createdAt: string;
}

const STATIC_POSTS: DiscussionPost[] = [
  {
    id: '1',
    author: 'Eswar Student',
    avatar: '👨‍💻',
    title: 'Tricky edge case in "Diameter of Binary Tree" problem',
    content: 'Hi everyone! I kept failing case 8 on the sandbox because my recursive height utility was computing local maximums instead of updating a global boundary reference. Resolved it by referencing an instance counter array.',
    tags: ['DSA', 'Trees', 'Recursion'],
    likes: 8,
    liked: false,
    bookmarked: false,
    comments: [
      { userId: 'Sneha Rao', text: 'Great insight, Eswar. An alternative is passing an object containing the diameter.', date: '1 Day Ago' }
    ],
    createdAt: '2 Days Ago'
  },
  {
    id: '2',
    author: 'Nikhil Kumar',
    avatar: '👨‍🎓',
    title: 'Amazon Online Assessment pattern breakdown',
    content: 'Just finished a mock drill for Amazon on the study planner. R1 was 1 system level process control riddle and 1 topological sorting problem. Time constraints were extremely tight.',
    tags: ['Amazon', 'Mock OA', 'Topological Sort'],
    likes: 12,
    liked: true,
    bookmarked: true,
    comments: [],
    createdAt: '3 Days Ago'
  }
];

export const CommunityDiscussion: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<DiscussionPost[]>(STATIC_POSTS);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('DSA');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);

  const handleLike = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
          liked: !p.liked
        };
      }
      return p;
    }));
  };

  const handleBookmark = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        showToast(p.bookmarked ? 'Bookmark removed.' : 'Post bookmarked.', 'info');
        return { ...p, bookmarked: !p.bookmarked };
      }
      return p;
    }));
  };

  const handleAddComment = (id: string) => {
    const txt = commentInputs[id] || '';
    if (!txt.trim()) return;
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          comments: [...p.comments, { userId: 'You', text: txt, date: 'Just Now' }]
        };
      }
      return p;
    }));
    setCommentInputs({ ...commentInputs, [id]: '' });
    showToast('Comment posted.', 'success');
  };

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('Title and content are required.', 'warning');
      return;
    }
    const newPost: DiscussionPost = {
      id: String(Date.now()),
      author: 'You',
      avatar: '👨‍💻',
      title: newTitle,
      content: newContent,
      tags: newTags.split(',').map(t => t.trim()),
      likes: 0,
      liked: false,
      bookmarked: false,
      comments: [],
      createdAt: 'Just Now'
    };
    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setNewTags('DSA');
    setShowCreate(false);
    showToast('Forum topic posted successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary-400" />
            <span>Community Discussion Board</span>
          </h2>
          <p className="text-xs text-gray-400">
            Share code solutions, ask placement doubts, upvote threads, and study interview postmortem comments.
          </p>
        </div>

        <Button onClick={() => setShowCreate(!showCreate)} className="text-xs flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" />
          <span>New Topic</span>
        </Button>
      </div>

      {/* Announcements */}
      <GlassCard className="p-4 bg-primary-950/15 border-primary-500/20 text-xs text-gray-300 flex items-start gap-3">
        <span className="p-1 rounded-lg bg-primary-600/10 border border-primary-500/20 text-primary-400">📢</span>
        <div>
          <span className="font-extrabold text-white block">System Announcement: Weekly mock coding sprint starting on Wednesday 08:00 PM IST.</span>
          <p className="text-[10px] text-gray-400 mt-0.5">Top 3 rank holders on achievements board earn direct recruiter profile referrals.</p>
        </div>
      </GlassCard>

      {/* Post creator form */}
      {showCreate && (
        <GlassCard className="space-y-4 max-w-xl">
          <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5 border-b border-dark-border pb-2">
            <Plus className="h-4 w-4 text-primary-400" /> Create New Topic
          </h4>
          <div className="space-y-3 text-xs text-gray-300">
            <div className="space-y-1">
              <label className="font-bold text-gray-400">Topic Title</label>
              <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Topic summary title..." />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-400">Content</label>
              <textarea className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white resize-none" rows={4} value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Share your doubt, code block, or interview experience details..." />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-400">Tags (Comma Separated)</label>
              <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={newTags} onChange={e => setNewTags(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreatePost} variant="primary">Submit Topic</Button>
            <Button onClick={() => setShowCreate(false)} variant="secondary">Cancel</Button>
          </div>
        </GlassCard>
      )}

      {/* Forums Thread Lists */}
      <div className="space-y-4 max-w-3xl">
        {posts.map(post => (
          <GlassCard key={post.id} className="space-y-4 p-5 border-dark-border/40">
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-dark-border/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{post.avatar}</span>
                <div>
                  <h5 className="font-extrabold text-white text-[11px]">{post.author}</h5>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">{post.createdAt}</p>
                </div>
              </div>

              <div className="flex gap-1">
                {post.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-[8px] font-black uppercase text-gray-400 tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Title & Body */}
            <div className="space-y-1 text-xs">
              <h4 className="font-extrabold text-white text-[12px]">{post.title}</h4>
              <p className="text-gray-400 leading-relaxed">{post.content}</p>
            </div>

            {/* Interaction Footer */}
            <div className="flex justify-between items-center border-t border-dark-border/20 pt-3 text-[10px] text-gray-500">
              <div className="flex gap-4">
                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 hover:text-white ${post.liked ? 'text-rose-450 font-black' : ''}`}>
                  <Heart className={`h-4 w-4 ${post.liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{post.likes} Likes</span>
                </button>
                <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> {post.comments.length} Comments</span>
              </div>

              <button onClick={() => handleBookmark(post.id)} className="hover:text-white">
                {post.bookmarked ? <BookmarkCheck className="h-4 w-4 text-accent-purple" /> : <Bookmark className="h-4 w-4" />}
              </button>
            </div>

            {/* Comments block */}
            {post.comments.length > 0 && (
              <div className="bg-dark-bg/60 border border-dark-border/40 rounded-xl p-3.5 space-y-2">
                {post.comments.map((c, i) => (
                  <div key={i} className="text-[10px] text-gray-400 leading-relaxed border-b border-dark-border/20 pb-2 last:border-0 last:pb-0">
                    <span className="font-bold text-white uppercase block text-[8px]">{c.userId} • {c.date}</span>
                    <p className="mt-0.5">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment composer */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a comment reply..."
                className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-primary-500/50"
                value={commentInputs[post.id] || ''}
                onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="p-1.5 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-300 hover:bg-primary-600/30 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
export default CommunityDiscussion;
