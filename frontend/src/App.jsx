import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Search, Pencil, Trash2, X, NotebookPen } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');

  async function request(path, options = {}) {
    const response = await fetch(API + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    if (!response.ok) throw new Error('Request failed');
    return response.status === 204 ? null : response.json();
  }

  async function loadRecipes() {
    try {
      const data = await request('/api/recipes');
      setRecipes(data);
    } catch {
      setNotice('Could not connect to your recipe notebook. Please try again.');
    }
  }

  useEffect(() => { loadRecipes(); }, []);

  const visibleRecipes = useMemo(() => recipes.filter(recipe =>
    (recipe.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (recipe.description || '').toLowerCase().includes(query.toLowerCase())
  ), [recipes, query]);

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(recipe) {
    setSelected(null);
    setEditing(recipe);
    setShowForm(true);
  }

  async function saveRecipe(title, notes) {
    try {
      const payload = {
        title: title.trim(),
        description: notes,
        imageUrl: null,
        prepMinutes: null,
        cookMinutes: null,
        servings: null,
        difficulty: null,
        cuisine: null,
        categoryId: null,
        category: null,
        ingredients: [],
        instructions: [],
        tags: [],
      };
      const saved = await request(editing ? '/api/recipes/' + editing.id : '/api/recipes', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setRecipes(current => editing
        ? current.map(item => item.id === saved.id ? saved : item)
        : [saved, ...current]);
      setShowForm(false);
      setEditing(null);
      setNotice('Saved in your recipe notebook.');
    } catch {
      setNotice('Could not save your note. Please try again.');
    }
  }

  async function deleteRecipe(recipe) {
    if (!window.confirm('Delete this recipe note?')) return;
    try {
      await request('/api/recipes/' + recipe.id, { method: 'DELETE' });
      setRecipes(current => current.filter(item => item.id !== recipe.id));
      setSelected(null);
    } catch {
      setNotice('Could not delete this note. Please try again.');
    }
  }

  return (
    <div className="grain min-h-screen text-ink">
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <img src="/recipe-book-icon.svg" alt="" className="h-11 w-11 rounded-xl object-cover shadow-sm" />
            <div>
              <div className="font-display text-xl font-semibold">My Recipe Book</div>
              <div className="text-[10px] uppercase tracking-[.2em] text-stone-400">A simple personal notebook</div>
            </div>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-olive">
            <Plus size={16} /> <span className="hidden sm:inline">Write a recipe</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 md:px-8 md:pt-14">
        <section className="rounded-[2rem] bg-[#e9eadf] px-7 py-9 md:px-12 md:py-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-olive"><NotebookPen size={15} /> Your own kitchen notes</div>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-6xl">Recipes worth <em className="text-olive">keeping.</em></h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 md:text-base">A quiet place to write down the recipes you want to remember and follow. Just a name and your notes—nothing extra.</p>
          <div className="mt-7 font-display text-2xl">{recipes.length} <span className="font-sans text-xs font-medium uppercase tracking-widest text-stone-500">saved {recipes.length === 1 ? 'recipe' : 'recipes'}</span></div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-clay">Your collection</p><h2 className="mt-2 font-display text-3xl">My recipes</h2></div>
            <div className="relative w-full sm:max-w-xs">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your notes..." className="w-full rounded-full border border-stone-200 bg-white px-11 py-3 text-sm outline-none focus:border-olive" />
            </div>
          </div>

          {visibleRecipes.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {visibleRecipes.map(recipe => (
                <article key={recipe.id} className="rounded-2xl border border-stone-200 bg-white/80 p-5 transition hover:border-olive/50 hover:shadow-sm">
                  <button onClick={() => setSelected(recipe)} className="block w-full text-left">
                    <h3 className="font-display text-2xl">{recipe.title}</h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-600">{recipe.description || 'No notes added yet.'}</p>
                  </button>
                  <div className="mt-5 flex justify-end gap-2 border-t border-stone-100 pt-3">
                    <button onClick={() => openEdit(recipe)} aria-label="Edit recipe" className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-olive"><Pencil size={16} /></button>
                    <button onClick={() => deleteRecipe(recipe)} aria-label="Delete recipe" className="rounded-full p-2 text-stone-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-stone-300 px-5 py-16 text-center">
              <NotebookPen size={28} className="mx-auto text-stone-300" />
              <h3 className="mt-4 font-display text-2xl">{query ? 'No matching recipes' : 'Your notebook is empty.'}</h3>
              <p className="mt-2 text-sm text-stone-500">{query ? 'Try a different search.' : 'When you find a recipe you want to follow, write it here.'}</p>
              {!query && <button onClick={openNew} className="mt-5 rounded-full bg-ink px-5 py-3 text-xs font-semibold text-white">Write your first recipe</button>}
            </div>
          )}
        </section>
      </main>

      {notice && <button onClick={() => setNotice('')} className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-xs text-white shadow-xl">{notice}</button>}

      {selected && <div className="modal-backdrop fixed inset-0 z-40 grid place-items-center overflow-y-auto p-4" onClick={() => setSelected(null)}>
        <div className="my-auto w-full max-w-2xl rounded-[2rem] bg-paper p-7 shadow-2xl md:p-10" onClick={event => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4"><h2 className="font-display text-3xl">{selected.title}</h2><button onClick={() => setSelected(null)} className="rounded-full bg-white p-2"><X size={19} /></button></div>
          <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-stone-700">{selected.description || 'No notes added yet.'}</p>
          <div className="mt-8 flex justify-end gap-2 border-t border-stone-200 pt-5">
            <button onClick={() => openEdit(selected)} className="flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-xs font-semibold"><Pencil size={14} /> Edit</button>
            <button onClick={() => deleteRecipe(selected)} className="flex items-center gap-2 rounded-full border border-red-100 px-4 py-2.5 text-xs font-semibold text-red-500"><Trash2 size={14} /> Delete</button>
          </div>
        </div>
      </div>}

      {showForm && <RecipeForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={saveRecipe} />}
    </div>
  );
}

function RecipeForm({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [notes, setNotes] = useState(initial?.description || '');
  return (
    <div className="modal-backdrop fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4" onClick={onClose}>
      <form onSubmit={event => { event.preventDefault(); onSave(title, notes); }} onClick={event => event.stopPropagation()} className="my-auto w-full max-w-2xl rounded-[2rem] bg-paper p-6 shadow-2xl md:p-9">
        <div className="flex items-center justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-clay">Your kitchen notebook</p><h2 className="mt-1 font-display text-3xl">{initial ? 'Edit recipe' : 'Write a recipe'}</h2></div>
          <button type="button" onClick={onClose} className="rounded-full bg-white p-2"><X size={19} /></button>
        </div>
        <label className="mt-7 block text-xs font-semibold text-stone-600">Recipe name
          <input required autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="Give your recipe a name" className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-olive" />
        </label>
        <label className="mt-5 block text-xs font-semibold text-stone-600">Your notes
          <textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Write the ingredients, steps, tips, or anything you want to remember..." rows={12} className="mt-2 w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm leading-7 outline-none focus:border-olive" />
        </label>
        <div className="mt-7 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-xs font-semibold text-stone-500">Cancel</button><button type="submit" className="rounded-full bg-ink px-6 py-3 text-xs font-semibold text-white">Save recipe</button></div>
      </form>
    </div>
  );
}
