'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Plus } from 'lucide-react'

interface Warranty {
  id: string
  product_name: string
  brand: string
  purchase_date: string
  warranty_months: number
  expiry_date: string
  receipt_url: string | null
  notes: string | null
  created_at: string
}

export default function WarrantiesPage() {
  const supabase = createClient()
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    product_name: '',
    brand: '',
    purchase_date: '',
    warranty_months: '12',
    receipt_url: '',
    notes: '',
  })

  useEffect(() => {
    fetchWarranties()
  }, [])

  async function fetchWarranties() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('warranties')
        .select('*')
        .order('expiry_date', { ascending: true })

      if (error) throw error
      setWarranties(data || [])
    } catch (error) {
      console.error('Error fetching warranties:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateExpiryDate(purchaseDate: string, months: number): string {
    const date = new Date(purchaseDate)
    date.setMonth(date.getMonth() + months)
    return date.toISOString().split('T')[0]
  }

  async function handleSave() {
    if (!formData.product_name || !formData.brand || !formData.purchase_date) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const expiryDate = calculateExpiryDate(formData.purchase_date, parseInt(formData.warranty_months))

      const { error } = await supabase.from('warranties').insert({
        product_name: formData.product_name,
        brand: formData.brand,
        purchase_date: formData.purchase_date,
        warranty_months: parseInt(formData.warranty_months),
        expiry_date: expiryDate,
        receipt_url: formData.receipt_url || null,
        notes: formData.notes || null,
      })

      if (error) throw error

      setFormData({
        product_name: '',
        brand: '',
        purchase_date: '',
        warranty_months: '12',
        receipt_url: '',
        notes: '',
      })
      setShowModal(false)
      await fetchWarranties()
    } catch (error) {
      console.error('Error saving warranty:', error)
      alert('Failed to save warranty')
    } finally {
      setSaving(false)
    }
  }

  function getStatusColor(expiryDate: string) {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysRemaining = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) {
      return { color: 'text-stone-500', bg: 'bg-stone-500/10', status: 'Expired', icon: '✓' }
    } else if (daysRemaining < 30) {
      return { color: 'text-red-400', bg: 'bg-red-500/10', status: 'Expiring Soon!', icon: '!' }
    } else if (daysRemaining < 90) {
      return { color: 'text-amber-400', bg: 'bg-amber-500/10', status: 'Review', icon: '⚠' }
    } else {
      return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', status: 'Active', icon: '✓' }
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Warranty Tracker</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Warranty
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-stone-400">Loading warranties...</div>
        ) : warranties.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
            <p className="text-stone-400 mb-4">No warranties tracked yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5"
            >
              Add Your First Warranty
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Purchase Date</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {warranties.map((warranty) => {
                    const status = getStatusColor(warranty.expiry_date)
                    return (
                      <tr key={warranty.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                        <td className="px-6 py-4 text-white font-medium">{warranty.product_name}</td>
                        <td className="px-6 py-4 text-stone-300">{warranty.brand}</td>
                        <td className="px-6 py-4 text-stone-400 text-sm">
                          {new Date(warranty.purchase_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-stone-400 text-sm">
                          {new Date(warranty.expiry_date).toLocaleDateString()}
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
              <h2 className="text-xl font-bold text-white">Add Warranty</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g., MacBook Pro 16in"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Brand *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Apple"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Purchase Date *</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Warranty Duration (Months)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.warranty_months}
                  onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Receipt URL (Optional)</label>
                <input
                  type="url"
                  value={formData.receipt_url}
                  onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                  placeholder="https://example.com/receipt"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
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
