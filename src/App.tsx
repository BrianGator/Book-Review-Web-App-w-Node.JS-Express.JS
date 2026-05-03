import React, { useState, useEffect } from 'react';
import { Search, Book as BookIcon, Star, User, LogIn, LogOut, Trash2, Edit3, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as api from './services/apiService';
import axios from 'axios';
import { FormEvent } from 'react';

interface Book {
  isbn: string;
  author: string;
  title: string;
  reviews: { [username: string]: string };
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"isbn" | "author" | "title">("title");
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authData, setAuthData] = useState({ username: "", password: "" });
  const [newReview, setNewReview] = useState("");
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await api.getBooks();
      setBooks(Object.values(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      fetchBooks();
      return;
    }
    setLoading(true);
    try {
      let results: any;
      if (searchType === "isbn") {
        const book = await api.getBookByISBN(searchQuery);
        results = [book];
      } else if (searchType === "author") {
        results = await api.getBooksByAuthor(searchQuery);
      } else {
        results = await api.getBooksByTitle(searchQuery);
      }
      setBooks(results);
    } catch (err) {
      console.error(err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/api/login" : "/api/register";
      const res = await axios.post(endpoint, authData);
      setMessage({ text: res.data.message, type: "success" });
      if (authMode === "login") {
        setUser({ username: authData.username });
        setAuthData({ username: "", password: "" });
      } else {
        setAuthMode("login");
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Auth failed", type: "error" });
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setMessage({ text: "Logged out successfully", type: "success" });
  };

  const submitReview = async (isbn: string) => {
    try {
      const res = await axios.put(`/api/auth/review/${isbn}`, { review: newReview });
      setMessage({ text: res.data.message, type: "success" });
      setNewReview("");
      // Refresh book data
      const updatedBook = await api.getBookByISBN(isbn);
      setSelectedBook(updatedBook);
      fetchBooks();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Failed to add review", type: "error" });
    }
  };

  const deleteReview = async (isbn: string) => {
    try {
      const res = await axios.delete(`/api/auth/review/${isbn}`);
      setMessage({ text: res.data.message, type: "success" });
      // Refresh book data
      const updatedBook = await api.getBookByISBN(isbn);
      setSelectedBook(updatedBook);
      fetchBooks();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Failed to delete review", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 font-sans text-[#1e293b]">
      <div className="max-w-[1400px] mx-auto h-full">
        {/* Alerts */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-sm font-medium">{message.text}</span>
              </div>
              <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-min">
          {/* Header Card / Logo */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setSelectedBook(null); fetchBooks(); }}>
              <div className="w-12 h-12 bg-[#4f46e5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <BookIcon size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#0f172a]">Express Bookshelf</h1>
                <p className="text-xs text-[#94a3b8] font-medium uppercase tracking-wider">RESTful Book Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="badge bg-[#f1f5f9] text-[#475569] px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-slate-200">v1.2.0</span>
              <span className="badge bg-[#e0e7ff] text-[#4338ca] px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-indigo-100 hidden sm:block">Runtime: Node.js</span>
            </div>
          </div>

          {/* Auth Session Card */}
          <div className="md:col-span-4 bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="font-[600] text-[12px] uppercase tracking-[0.05em] text-[#64748b] mb-4 flex justify-between items-center">
              <span>Auth Session</span>
              <span className={`badge ${user ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fef3c7] text-[#92400e]'}`}>
                {user ? 'Authenticated' : 'Guest'}
              </span>
            </div>
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4f46e5] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0f172a]">{user.username}</div>
                    <div className="text-[11px] text-[#94a3b8]">JWT Session Active</div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#64748b] max-w-[120px] leading-tight">Log in to add or modify reviews</span>
                <button 
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-xs font-bold text-[#4f46e5] hover:underline underline-offset-4"
                >
                  {authMode === "login" ? "Create Account" : "Login"}
                </button>
              </div>
            )}
          </div>

          {!selectedBook ? (
            <>
              {/* Search Card */}
              <div className="md:col-span-4 bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <div className="font-[600] text-[12px] uppercase tracking-[0.05em] text-[#64748b] mb-4 flex justify-between items-center">
                  <span>Quick Search</span>
                  <span className="badge">GET /isbn/:id</span>
                </div>
                <div className="space-y-4">
                  <div className="flex bg-[#f8fafc] p-1 rounded-lg border border-slate-200">
                    {(["title", "author", "isbn"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSearchType(type)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase ${
                          searchType === type ? "bg-white text-[#4f46e5] shadow-sm" : "text-[#94a3b8] hover:text-[#64748b]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 bg-[#f8fafc] border border-slate-200 px-3 py-2 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder={`Enter ${searchType}...`}
                    />
                    <button 
                      onClick={handleSearch}
                      className="bg-[#4f46e5] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="md:col-span-4 bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <div className="font-[600] text-[12px] uppercase tracking-[0.05em] text-[#64748b] mb-4 flex justify-between items-center">
                  <span>System Status</span>
                  <span className="badge bg-[#ecfdf5] text-[#059669]">Online</span>
                </div>
                <div className="grid grid-cols-2 gap-3 h-full pb-4">
                  <div className="bg-[#f8fafc] p-3 rounded-xl flex flex-col justify-center border border-slate-100">
                    <span className="text-xl font-bold text-[#4f46e5]">{books.length}</span>
                    <span className="text-[10px] text-[#64748b] font-medium uppercase">Catalog Size</span>
                  </div>
                  <div className="bg-[#f8fafc] p-3 rounded-xl flex flex-col justify-center border border-slate-100">
                    <span className="text-xl font-bold text-[#4f46e5]">100%</span>
                    <span className="text-[10px] text-[#64748b] font-medium uppercase">Uptime</span>
                  </div>
                </div>
              </div>

              {/* Registration/Login Form Box (if not logged in) */}
              {!user && (
                <div className="md:col-span-4 bg-slate-900 rounded-[16px] p-5 shadow-lg flex flex-col justify-center">
                  <form onSubmit={handleAuth} className="space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={authData.username}
                        onChange={(e) => setAuthData({...authData, username: e.target.value})}
                        className="flex-1 bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-xs placeholder-white/40 focus:ring-1 focus:ring-indigo-400 outline-none"
                        placeholder="Username"
                        required
                      />
                      <input 
                        type="password" 
                        value={authData.password}
                        onChange={(e) => setAuthData({...authData, password: e.target.value})}
                        className="flex-1 bg-white/10 border border-white/20 px-3 py-2 rounded-lg text-white text-xs placeholder-white/40 focus:ring-1 focus:ring-indigo-400 outline-none"
                        placeholder="Password"
                        required
                      />
                    </div>
                    <button className="w-full py-2 bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all uppercase tracking-wider">
                      {authMode === "login" ? "Sign In" : "Register Account"}
                    </button>
                  </form>
                </div>
              )}

              {/* Main Catalog Explorer */}
              <div className={`${user ? 'md:col-span-12' : 'md:col-span-12'} bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]`}>
                <div className="font-[600] text-[12px] uppercase tracking-[0.05em] text-[#64748b] mb-6 flex justify-between items-center">
                  <span>Catalog Explorer</span>
                  <span className="badge">GET /api/books</span>
                </div>
                
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-[#94a3b8]">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">Refreshing Data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.map((book) => (
                      <motion.div 
                        key={book.isbn}
                        layoutId={book.isbn}
                        onClick={() => setSelectedBook(book)}
                        className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0 hover:bg-[#f8fafc] rounded-lg transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-300 group-hover:text-[#4f46e5] group-hover:bg-white transition-all">
                            <BookIcon size={18} />
                          </div>
                          <div className="book-info">
                            <h4 className="m-0 text-[13px] font-bold text-[#0f172a] line-clamp-1 group-hover:text-[#4f46e5]">{book.title}</h4>
                            <p className="m-0 text-[11px] text-[#94a3b8]">{book.author} • <span className="font-mono text-[9px]">{book.isbn}</span></p>
                          </div>
                        </div>
                        <span className="badge bg-[#ecfdf5] text-[#059669] text-[9px] min-w-[32px] text-center">
                          {Object.keys(book.reviews).length} ★
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Detail View as a Large Card */
            <div className="md:col-span-12 bg-white border border-slate-200 rounded-[16px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-56 shrink-0">
                  <div className="aspect-[3/4] bg-[#f8fafc] rounded-2xl border border-slate-100 flex items-center justify-center text-slate-200 relative overflow-hidden">
                    <BookIcon size={100} strokeWidth={0.5} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent"></div>
                  </div>
                  <button 
                    onClick={() => setSelectedBook(null)}
                    className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider text-[#64748b] hover:bg-slate-50 transition-all"
                  >
                    Discard View
                  </button>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="font-[600] text-[12px] uppercase tracking-[0.05em] text-[#4f46e5] mb-2">Book Context</div>
                  <h2 className="text-3xl font-bold text-[#0f172a] mb-2">{selectedBook.title}</h2>
                  <p className="text-lg text-[#64748b] font-medium mb-6">by {selectedBook.author}</p>
                  
                  <div className="flex gap-3 mb-10">
                    <div className="badge bg-slate-100 px-3 py-1 font-mono">ISBN: {selectedBook.isbn}</div>
                    <div className="badge bg-slate-100 px-3 py-1">{Object.keys(selectedBook.reviews).length} Global Reviews</div>
                  </div>

                  <div className="flex-1">
                    <div className="font-[600] text-[11px] uppercase tracking-[0.05em] text-[#64748b] mb-4">Feedback Stream</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(selectedBook.reviews).length === 0 ? (
                        <div className="col-span-2 py-10 text-center text-[13px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                          No feedback available for this resource.
                        </div>
                      ) : (
                        Object.entries(selectedBook.reviews).map(([reviewer, review]) => (
                          <div key={reviewer} className="bg-[#f8fafc] p-4 rounded-xl relative group">
                            <p className="m-0 text-[13px] leading-relaxed text-[#334155]">"{review}"</p>
                            <div className="mt-4 flex justify-between items-center text-[11px] text-[#94a3b8]">
                              <span className="font-bold flex items-center gap-1">
                                <div className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[8px]">{reviewer[0].toUpperCase()}</div>
                                {reviewer}
                              </span>
                              {user?.username === reviewer && (
                                <div className="flex gap-2">
                                  <button onClick={() => deleteReview(selectedBook.isbn)} className="text-rose-400 hover:text-rose-600">Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {user && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <div className="font-[600] text-[11px] uppercase tracking-[0.05em] text-[#64748b] mb-4">PUT /api/auth/review/:isbn</div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          className="flex-1 bg-[#f8fafc] border border-slate-200 px-4 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Your unique feedback..."
                        />
                        <button 
                          onClick={() => submitReview(selectedBook.isbn)}
                          className="bg-[#4f46e5] text-white px-6 py-2 rounded-lg text-xs font-bold uppercase hover:bg-indigo-700 transition-all"
                        >
                          Push Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* System Info Cards - The "Bento" fill-ins */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="font-[600] text-[12px] uppercase tracking-[0.05em] text-[#64748b] mb-3">API Performance</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#4f46e5]">24ms</span>
              <span className="text-[10px] text-[#94a3b8] font-bold">AVG LATE</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="w-[85%] h-full bg-indigo-500 rounded-full"></div>
            </div>
          </div>

          <div className="md:col-span-3 bg-white border border-slate-200 rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="font-[600] text-[12px] uppercase tracking-[0.05em] text-[#64748b] mb-3">Auth Protocol</div>
            <div className="text-[13px] font-bold text-[#475569] mb-1">express-session</div>
            <div className="text-[10px] text-[#94a3b8] tracking-tight">Middleware security active with fingerprint rotation.</div>
          </div>

          <div className="md:col-span-6 bg-indigo-600 rounded-[16px] p-5 shadow-lg flex items-center justify-between text-white overflow-hidden relative">
            <div className="z-10">
              <div className="font-[600] text-[11px] uppercase tracking-[0.1em] text-white/60 mb-1">Developer Notice</div>
              <p className="text-[13px] font-medium max-w-[300px]">Project implementation for Node.js Back-End Development Course.</p>
            </div>
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <BookIcon size={140} />
            </div>
            <div className="z-10 flex gap-2">
              <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-all backdrop-blur-sm border border-white/10">Docs</button>
              <button className="px-3 py-1.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm">Repo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
