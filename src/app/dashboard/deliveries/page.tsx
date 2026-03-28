'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Plus } from 'lucide-react'

interface Delivery {
  id: string
  carrier: string
  tracking_number: string
  expected_delivery_date: string
  actual_delivery_date: string | null
  is_late: boolean
  credit_amount: number | null
  created_at: string
}

export default function DeliveriesPage() {
  const supabase = createClient()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    carrier: 'Amazon',
    tracking_number: '',
    expected_delivery_date: '',
  })

  const carriers = ['Amazon', 'FedEx', 'UPS', 'USPS', 'DHL', 'Other']

  useEffect(() => {
    fetchDeliveries()
  }, [])

  async function fetchDeliveries() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .order('expected_delivery_date', { ascending: false })

      if (error) throw error
      setDeliveries(data || [])
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!formData.tracking_number || !formData.expected_delivery_date) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from('delivery_tracking').insert({
        carrier: formData.carrier,
        tracking_number: formData.tracking_number,
        expected_delivery_date: formData.expected_delivery_date,
        is_late: false,
        actual_delivery_date: null,
        credit_amount: null,
      })

      if (error) throw error

      setFormData({
        carrier: 'Amazon',
        tracking_number: '',
        expected_delivery_date: '',
      })
      setShowModal(false)
      await fetchDeliveries()
    } catch (error) {
      console.error('Error saving delivery:', error)
      alert('Failed to save delivery')
    } finally {
      setSaving(false)
    }
  }

  async function updateActualDate(id: string, actualDate: string) {
    try {
      const expectedDate = new Date(deliveries.find(d => d.id === id)?.expected_delivery_date || '')
      const actual = new Date(actualDate)
      const isLate = actual > expectedDate

      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          actual_delivery_date: actualDate,
          is_late: isLate,
        })
        .eq('id', id)

      if (error) throw error
      await fetchDeliveries()
    } catch (error) {
      console.error('Error updating delivery:', error)
    }
  }

  async function updateCredit(id: string, amount: number) {
    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .update({ credit_amount: amount })
        .eq('id', id)

      if (error) throw error
      await fetchDeliveries()
    } catch (error) {
      console.error('Error updating credit:', error)
    }
  }

  function getDeliveryStatus(delivery: Delivery) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expectedDate = new Date(delivery.expected_delivery_date)
    expectedDate.setHours(0, 0, 0, 0)

    if (delivery.actual_delivery_date) {
      const actualDate = new Date(delivery.actual_delivery_date)
      actualDate.setHours(0, 0, 0, 0)

      if (actualDate > expectedDate) {
        return { label: 'Credit Eligible', color: 'text-amber-400', bg: 'bg-amber-500/10' }
      }
      return { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    }

    if (expectedDate < today) {
      return { label: 'Late!', color: 'text-red-400', bg: 'bg-red-500/10' }
    }

    return { label: 'In Transit', color: 'text-blue-400', bg: 'bg-blue-500/10' }
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Late Delivery Tracker</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Plus size={18} />
            Track Delivery
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-stone-400">Loading deliveries...</div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
            <p className="text-stone-400 mb-4">No deliveries tracked yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5"
            >
              Track Your First Delivery
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Carrier</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Tracking #</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Expected Date</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Actual Date</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => {
                    const status = getDeliveryStatus(delivery)
                    return (
                      <tr key={delivery.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                        <td className="px-6 py-4 text-white font-medium">{delivery.carrier}</td>
                        <td className="px-6 py-4 text-stone-300 font-mono text-sm">{delivery.tracking_number}</td>
                        <td className="px-6 py-4 text-stone-400 text-sm">
                          {new Date(delivery.expected_delivery_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <input
                            type="date"
                            value={delivery.actual_delivery_date || ''}
                            onChange={(e) => updateActualDate(delivery.id, e.target.value)}
                            placeholder="Set date"
                            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1 text-xs w-32"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-stone-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={delivery.credit_amount || ''}
                              onChange={(e) => updateCredit(delivery.id, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-20 bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 text-xs"
                            />
                          </div>
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
              <h2 className="text-xl font-bold text-white">Track Delivery</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Carrier</label>
                <select
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
                >
                  {carriers.map((carrier) => (
                    <option key={carrier} value={carrier}>
                      {carrier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Tracking Number *</label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  placeholder="e.g., 1234567890"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Expected Delivery Date *</label>
                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
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
