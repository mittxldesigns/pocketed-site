'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { RETAILER_POLICIES } from '@/lib/retailer-policies';

interface Purchase {
  id: string;
  item_name: string;
  store_name: string;
  price: number;
  purchase_date: string;
  return_deadline: string;
  category: string;
  receipt_url?: string;
}

const RETAILER_OPTIONS = [
  'Amazon',
  'Target',
  'Best Buy',
  'Walmart',
  'Apple',
  'Nike',
  'Home Depot',
  'Costco',
  'Nordstrom',
  'Sephora',
  "Macy's",
  'REI',
  "Lowe's",
  'Staples',
  "Kohl's",
  'Gap',
  'Old Navy',
  'IKEA',
  "Trader Joe's",
  'Whole Foods',
  'Other',
];

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home',
  'Food',
  'Health',
  'Other',
];

export default function PurchasesPage() {
  const supabase = createClient();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    itemName: '',
    price: '',
    purchaseDate: '',
    category: 'Electronics',
    receiptUrl: '',
  });

  useEffect(() => {
    fetchPurchases();
  }, [supabase]);

  const fetchPurchases = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReturnDeadline = (
    storeName: string,
    purchaseDate: string,
    category: string
  ): string => {
    const storeKey = Object.keys(RETAILER_POLICIES).find(
      (key) => RETAILER_POLICIES[key].name === storeName
    );

    let days = RETAILER_POLICIES[storeKey || 'amazon'].standardDays;

    if (category === 'Electronics') {
      days = RETAILER_POLICIES[storeKey || 'amazon'].electronicsDays;
    }

    if (days === -1) {
      // Unlimited returns
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    }

    const purchase = new Date(purchaseDate);
    const deadline = new Date(purchase.getTime() + days * 24 * 60 * 60 * 1000);
    return deadline.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !formData.storeName) {
        alert('Please select a store');
        setIsSaving(false);
        return;
      }

      const returnDeadline = calculateReturnDeadline(
        formData.storeName,
        formData.purchaseDate,
        formData.category
      );

      const { error } = await supabase.from('purchases').insert({
        user_id: user.id,
        item_name: formData.itemName,
        store_name: formData.storeName,
        price: parseFloat(formData.price),
        purchase_date: formData.purchaseDate,
        return_deadline: returnDeadline,
        category: formData.category,
        receipt_url: formData.receiptUrl || null,
      });

      if (error) throw error;

      setFormData({
        storeName: '',
        itemName: '',
        price: '',
        purchaseDate: '',
        category: 'Electronics',
        receiptUrl: '',
      });
      setIsModalOpen(false);
      fetchPurchases();
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Failed to save purchase');
    } finally {
      setIsSaving(false);
    }
  };

  const getDaysRemaining = (deadline: string): number => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (deadline: string) => {
    const days = getDaysRemaining(deadline);
    if (days < 0) return 'text-stone-400';
    if (days < 7) return 'text-red-400';
    if (days < 14) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getStatusBg = (deadline: string) => {
    const days = getDaysRemaining(deadline);
    if (days < 0) return 'bg-stone-500/10';
    if (days < 7) return 'bg-red-500/10';
    if (days < 14) return 'bg-amber-500/10';
    return 'bg-emerald-500/10';
  };

  const getStatusLabel = (deadline: string) => {
    const days = getDaysRemaining(deadline);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Purchases</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold px-4 py-2 flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add Purchase
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-white/[0.06] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Add Purchase
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Store */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Store
                </label>
                <select
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-amber-500 transition"
                  required
                >
                  <option value="">Select a store</option>
                  {RETAILER_OPTIONS.map((store) => (
                    <option key={store} value={store}>
                      {store}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  placeholder="e.g., Wireless Headphones"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Purchase Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="99.99"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-amber-500 transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Receipt URL */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Receipt URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.receiptUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-xl font-semibold py-2 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600 text-stone-950 rounded-xl font-semibold py-2 transition disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchases Table */}
      {purchases.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center">
          <p className="text-stone-400 mb-4">
            No purchases yet. Start by adding your first purchase.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold px-6 py-2 transition"
          >
            Add your first purchase
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left px-6 py-3 text-stone-400 font-semibold text-sm">
                    Item
                  </th>
                  <th className="text-left px-6 py-3 text-stone-400 font-semibold text-sm">
                    Store
                  </th>
                  <th className="text-left px-6 py-3 text-stone-400 font-semibold text-sm">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 text-stone-400 font-semibold text-sm">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-stone-400 font-semibold text-sm">
                    Return Deadline
                  </th>
                  <th className="text-left px-6 py-3 text-stone-400 font-semibold text-sm">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b border-white/[0.06] hover:bg-white/[0.02] transition"
                  >
                    <td className="px-6 py-4 text-white">
                      {purchase.item_name}
                    </td>
                    <td className="px-6 py-4 text-stone-400">
                      {purchase.store_name}
                    </td>
                    <td className="px-6 py-4 text-white">
                      ${purchase.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-stone-400">
                      {new Date(purchase.purchase_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-stone-400">
                      {new Date(purchase.return_deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                          purchase.return_deadline
                        )} ${getStatusBg(purchase.return_deadline)}`}
                      >
                        {getStatusLabel(purchase.return_deadline)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
