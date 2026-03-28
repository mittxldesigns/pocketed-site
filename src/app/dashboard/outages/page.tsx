'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Plus } from 'lucide-react'

interface OutageClaim {
  id: string
  provider: string
  outage_date: string
  duration_hours: number
  estimated_credit: number
  actual_credit: number | null
  status: string
  notes: string | null
  created_at: string
}

export default function OutagesPage() {
  const supabase = createClient()
  const [claims, setClaims] = useState<OutageClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    provider: 'Comcast/Xfinity',
    outage_date: '',
    duration_hours: '',
    notes: '',
    monthly_bill: '',
  })

  const providers = [
    'Comcast/Xfinity',
    'AT&T',
    'Verizon',
    'T-Mobile',
    'Spectrum',
    'Cox',
    'CenturyLink',
    'Netflix',
    'Hulu',
    'Disney+',
    'YouTube TV',
    'Spotify',
    'Other',
  ]

  const statuses = ['Pending', 'Filed', 'Approved', 'Denied']

  useEffect(() => {
    fetchClaims()
  }, [])

  async function fetchClaims() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('outage_claims')
        .select('*')
        .order('outage_date', { ascending: false })

      if (error) throw error
      setClaims(data || [])
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateEstimatedCredit(monthlyBill: number, durationHours: number): number {
    const dailyRate = monthlyBill / 30
    const hourlyRate = dailyRate / 24
    return Math.round(hourlyRate * durationHours * 100) / 100
  }

  async function handleSave() {
    if (!formData.outage_date || !formData.duration_hours || !formData.monthly_bill) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const estimatedCredit = calculateEstimatedCredit(
        parseFloat(formData.monthly_bill),
        parseFloat(formData.duration_hours)
      )

      const { error } = await supabase.from('outage_claims').insert({
        provider: formData.provider,
        outage_date: formData.outage_date,
        duration_hours: parseFloat(formData.duration_hours),
        estimated_credit: estimatedCredit,
        actual_credit: null,
        status: 'Pending',
        notes: formData.notes || null,
      })

      if (error) throw error

      setFormData({
        provider: 'Comcast/Xfinity',
        outage_date: '',
        duration_hours: '',
        notes: '',
        monthly_bill: '',
      })
      setShowModal(false)
      await fetchClaims()
    } catch (error) {
      console.error('Error saving claim:', error)
      alert('Failed to save outage claim')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase.from('outage_claims').update({ status: newStatus }).eq('id', id)

      if (error) throw error
      await fetchClaims()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  async function updateActualCredit(id: string, amount: number) {
    try {
      const { error } = await supabase.from('outage_claims').update({ actual_credit: amount }).eq('id', id)

      if (error) throw error
      await fetchClaims()
    } catch (error) {
      console.error('Error updating credit:', error)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'Approved':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
      case 'Filed':
        return { color: 'text-blue-400', bg: 'bg-blue-500/10' }
      case 'Denied':
        return { color: 'text-red-400', bg: 'bg-red-500/10' }
      default:
        return { color: 'text-amber-400', bg: 'bg-amber-500/10' }
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Outage Credits</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Plus size={18} />
            Report Outage
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-stone-400">Loading outage claims...</div>
        ) : claims.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
            <p className="text-stone-400 mb-4">No outage claims recorded yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold text-sm px-5 py-2.5"
            >
              Report Your First Outage
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Duration (hrs)</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Est. Credit</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Actual Credit</th>
                    <th className="px-6 py-4 text-left text-stone-500 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => {
                    const statusColor = getStatusColor(claim.status)
                    return (
                      <tr key={claim.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                        <td className="px-6 py-4 text-white font-medium">{claim.provider}</td>
                        <td className="px-6 py-4 text-stone-300">
                          {new Date(claim.outage_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-stone-400">{claim.duration_hours.toFixed(1)}</td>
                        <td className="px-6 py-4 text-amber-400 font-medium">${claim.estimated_credit.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-stone-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={claim.actual_credit || ''}
                              onChange={(e) => updateActualCredit(claim.id, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-20 bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 text-xs"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={claim.status}
                            onChange={(e) => updateStatus(claim.id, e.target.value)}
                            className={`bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1 text-xs font-medium cursor-pointer ${statusColor.color}`}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
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
              <h2 className="text-xl font-bold text-white">Report Outage</h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
                >
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Outage Date *</label>
                <input
                  type="date"
                  value={formData.outage_date}
                  onChange={(e) => setFormData({ ...formData, outage_date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Duration (Hours) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                  placeholder="2.5"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Monthly Bill Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_bill}
                  onChange={(e) => setFormData({ ...formData, monthly_bill: e.target.value })}
                  placeholder="99.99"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Details about the outage..."
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
