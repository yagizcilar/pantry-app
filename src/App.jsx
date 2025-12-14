import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Plus, Trash2, ShoppingBag, ChefHat } from 'lucide-react'
import { clsx } from 'clsx'

export default function App() {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch items on load
  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setItems(data)
    } catch (error) {
      console.error('Error fetching:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Add Item
  async function addItem(e) {
    e.preventDefault()
    if (!newItem.trim()) return

    const { data, error } = await supabase
      .from('pantry_items')
      .insert([{ name: newItem, status: 'Full' }])
      .select()

    if (error) {
      console.error('Error adding:', error.message)
    } else {
      setItems([data[0], ...items])
      setNewItem('')
    }
  }

  // Toggle Status
  async function toggleStatus(id, currentStatus) {
    const statusFlow = {
      'Full': 'Running Low',
      'Running Low': '< 2',
      '< 2': 'Out of Stock',
      'Out of Stock': 'Full'
    }
    const nextStatus = statusFlow[currentStatus] || 'Full'

    // Optimistic update (update UI instantly before waiting for DB)
    setItems(items.map(item => 
      item.id === id ? { ...item, status: nextStatus } : item
    ))

    const { error } = await supabase
      .from('pantry_items')
      .update({ status: nextStatus })
      .eq('id', id)

    if (error) console.error('Error updating:', error.message)
  }

  // Delete Item
  async function deleteItem(id) {
    setItems(items.filter(item => item.id !== id))
    const { error } = await supabase.from('pantry_items').delete().eq('id', id)
    if (error) console.error('Error deleting:', error.message)
  }

  // Sorting: Active items first, 'Out of Stock' last
  const sortedItems = [...items].sort((a, b) => {
    if (a.status === 'Out of Stock' && b.status !== 'Out of Stock') return 1
    if (a.status !== 'Out of Stock' && b.status === 'Out of Stock') return -1
    return 0
  })

  // Status Styling Helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Full': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Running Low': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case '< 2': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Out of Stock': return 'bg-red-100 text-red-700 border-red-200 line-through opacity-70'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10 border-b border-slate-100">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <ChefHat size={24} className="text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">PantryPal</h1>
          </div>
          <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-500">
             {items.length} Items
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Input Area */}
        <form onSubmit={addItem} className="relative mb-8 group">
          <input
            type="text"
            placeholder="Add grocery item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg placeholder:text-slate-400"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-md active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </form>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
             <div className="text-center text-slate-400 py-10">Loading pantry...</div>
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-12 px-6 opacity-50">
               <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300"/>
               <p className="text-slate-500">Your pantry is empty!</p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md"
              >
                <div className="flex flex-col">
                  <span className={clsx("font-medium text-lg text-slate-800", item.status === 'Out of Stock' && "text-slate-400 line-through")}>
                    {item.name}
                  </span>
                  {/* Status Pill */}
                  <button 
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={clsx(
                      "mt-2 text-xs font-bold px-3 py-1 rounded-full border w-fit transition-colors uppercase tracking-wider",
                      getStatusStyle(item.status)
                    )}
                  >
                    {item.status}
                  </button>
                </div>

                <button 
                  onClick={() => deleteItem(item.id)}
                  className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}