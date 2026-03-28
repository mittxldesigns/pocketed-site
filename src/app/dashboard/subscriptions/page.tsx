'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Plus } from 'lucide-react'

interface Subscription {
  id: string
  service_name: string
  monthly_cost: number
  billing_date: number
  category: string
  last_used_date: string | null
  notes: string | null
  created_at: string
}

export default function SubscriptionsPage() {
  const supabase = createClient()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    service_name: '',
    monthly_cost: '',
    billing_date: '',
    category: 'Software',
    last_used_date: '',
    notes: '',
  })

  const categories = ['Streaming', 'Music', 'Software', 'Gaming', 'News', 'Fitness', 'Storage', 'Other']

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  async function fetchSubscriptions() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubscriptions(data || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!formData.service_name || !formData.monthly_cost || !formData.billing_date) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from('subscriptions').insert({
        service_name: formData.service_name,
        monthly_cost: parseFloat(formData.monthly_cost),
        billing_date: parseInt(formData.billing_date),
        category: formData.category,
        last_used_date: formData.last_used_date || null,
        notes: formData.notes || null,
      })

      if (error) throw error

      setFormData({
        service_name: '',
        monthly_cost: '',
        billing_date: '',
        category: 'Software',
        last_used_date: '',
        notes: '',
      })
      setShowModal(false)
      await fetchSubscriptions()
    } catch (error) {
      console.error('Error saving subscription:', error)
      alert('Failed to save subscription')
    } finally {
      setSaving(false)
    }
  }

  function getStatusColor(lastUsedDate: string | null) {
    if (!lastUsedDate) return { color: 'text-stone-400', bg: 'bg-stone-500/10', status: 'Unknown' }

    const daysAgo = Math.floor((Date.now() - new Date(lastUsedDate).getTime()) / (1000 * 60 * 60 * 24))

    if (daysAgo > 60) {
      return { color: 'text-red-400', bg: 'bg-red-500/10', status: 'Unused' }
    } else if (daysAgo > 30) {
      return { color: 'text-amber-400', bg: 'bg-amber-500/10', status: 'Review' }
    } else {
      return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', status: 'Active' }
    }
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.monthly_cost, 0)
  const unusedAndReview = subscriptions.filter(sub => {
    const daysAgo = sub.last_used_date
      ? Math.floor((Date.now() - new Date(sub.last_used_date).getTime()) / (1000 * 60 * 60 * 24))
      : 999
    return daysAgo > 30
  })
  const potentialSavings = unusedAndReview.reduce((sum, sub) => sum + sub.monthly_cost, 0)

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Subscription Audit</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Subscription
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <p className="text-stone-400 text-sm mb-2">Total Monthly Spend</p>
            <p className="text-3xl font-bold text-white">${totalMonthly.toFixed(2)}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <p className="text-stone-400 text-sm mb-2">Potential Savings</p>
            <p className="text-3xl font-bold text-amber-400">${potentialSavings.toFixed(2)}</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-stone-400">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
            <p className="text-stone-400 mb-4">No subscriptions tracked yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5"
            >
              Add Your First Subscription
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Cost/Mo</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Last Used</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const status = getStatusColor(sub.last_used_date)
                    return (
                      <tr key={sub.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                        <td className="px-6 py-4 text-white font-medium">{sub.service_name}</td>
                        <td className="px-6 py-4 text-stone-300">${sub.monthly_cost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-stone-400 text-sm">{sub.category}</td>
                        <td className="px-6 py-4 text-stone-400 text-sm">
                          {sub.last_used_date ? new Date(sub.last_used_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-white/[0.06] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Subscription</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Service Name *</label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="e.g., Netflix"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Monthly Cost *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_cost}
                  onChange={(e) => setFormData({ ...formData, monthly_cost: e.target.value })}
                  placeholder="9.99"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Billing Date (Day of Month) *</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.billing_date}
                  onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
                  placeholder="15"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Last Used Date</label>
                <input
                  type="date"
                  value={formData.last_used_date}
                  onChange={(e) => setFormData({ ...formData, last_used_date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08] rounded-xl font-semibold text-sm px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
