'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, TrendingDown, Truck, CheckCircle, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Purchase {
  id: string;
  product_name: string;
  store: string;
  return_deadline: string;
  amount: number;
}

interface Warranty {
  id: string;
  product_name: string;
  brand: string;
  expiry_date: string;
  amount: number;
}

interface PriceAlert {
  id: string;
  product_name: string;
  store: string;
  original_price: number;
  current_price: number;
  savings: number;
}

interface DeliveryTracking {
  id: string;
  carrier: string;
  tracking_number: string;
  expected_date: string;
  purchase_item: string;
}

export default function AlertsPage() {
  const [expiringReturns, setExpiringReturns] = useState<Purchase[]>([]);
  const [expiringWarranties, setExpiringWarranties] = useState<Warranty[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [lateDeliveries, setLateDeliveries] = useState<DeliveryTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const today = new Date();
        const in14Days = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Fetch expiring returns
        const { data: returnsData } = await supabase
          .from('purchases')
          .select('*')
          .gt('return_deadline', today.toISOString())
          .lt('return_deadline', in14Days.toISOString());

        // Fetch expiring warranties
        const { data: warrantiesData } = await supabase
          .from('warranties')
          .select('*')
          .gt('expiry_date', today.toISOString())
          .lt('expiry_date', in30Days.toISOString());

        // Fetch pending price alerts
        const { data: priceAlertsData } = await supabase
          .from('price_alerts')
          .select('*')
          .eq('status', 'pending');

        // Fetch late deliveries
        const { data: deliveriesData } = await supabase
          .from('delivery_tracking')
          .select('*')
          .lt('expected_date', today.toISOString())
          .is('actual_date', null);

        setExpiringReturns(returnsData || []);
        setExpiringWarranties(warrantiesData || []);
        setPriceAlerts(priceAlertsData || []);
        setLateDeliveries(deliveriesData || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [supabase]);

  const allEmpty =
    expiringReturns.length === 0 &&
    expiringWarranties.length === 0 &&
    priceAlerts.length === 0 &&
    lateDeliveries.length === 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-stone-900 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">Alerts</h1>
          <p className="text-stone-400">
            Time-sensitive items across all your accounts
          </p>
        </motion.div>

        {allEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/10 bg-white/[0.02]"
          >
            <CheckCircle size={48} className="text-emerald-400 mb-4" />
            <p className="text-xl font-semibold mb-2">All clear!</p>
            <p className="text-stone-400">No urgent alerts.</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Expiring Returns Section */}
            <AlertSection
              icon={Clock}
              title="Expiring Returns"
              color="amber"
              items={expiringReturns}
              emptyMessage="No returns expiring soon"
              renderItem={(item: Purchase) => (
                <div key={item.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.product_name}</p>
                    <p className="text-sm text-stone-400">{item.store}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Expires {new Date(item.return_deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-400">${item.amount}</p>
                    <button className="text-xs text-amber-400 hover:text-amber-300 mt-2">
                      Start Return
                    </button>
                  </div>
                </div>
              )}
            />

            {/* Expiring Warranties Section */}
            <AlertSection
              icon={AlertCircle}
              title="Expiring Warranties"
              color="blue"
              items={expiringWarranties}
              emptyMessage="No warranties expiring soon"
              renderItem={(item: Warranty) => (
                <div key={item.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.product_name}</p>
                    <p className="text-sm text-stone-400">{item.brand}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Expires {new Date(item.expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-400">${item.amount}</p>
                    <button className="text-xs text-blue-400 hover:text-blue-300 mt-2">
                      Review Warranty
                    </button>
                  </div>
                </div>
              )}
            />

            {/* Price Drop Opportunities Section */}
            <AlertSection
              icon={TrendingDown}
              title="Price Drop Opportunities"
              color="emerald"
              items={priceAlerts}
              emptyMessage="No price drops available"
              renderItem={(item: PriceAlert) => (
                <div key={item.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.product_name}</p>
                    <p className="text-sm text-stone-400">{item.store}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Was ${item.original_price} → Now ${item.current_price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-400">+${item.savings}</p>
                    <button className="text-xs text-emerald-400 hover:text-emerald-300 mt-2">
                      Claim Refund
                    </button>
                  </div>
                </div>
              )}
            />

            {/* Late Deliveries Section */}
            <AlertSection
              icon={Truck}
              title="Late Deliveries"
              color="red"
              items={lateDeliveries}
              emptyMessage="All deliveries on track"
              renderItem={(item: DeliveryTracking) => (
                <div key={item.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{item.purchase_item}</p>
                    <p className="text-sm text-stone-400">{item.carrier}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Was due {new Date(item.expected_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-xs text-red-400 hover:text-red-300 whitespace-nowrap ml-4">
                    Claim Credit
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface AlertSectionProps {
  icon: React.ComponentType<{ size: number; className: string }>;
  title: string;
  color: 'amber' | 'blue' | 'emerald' | 'red';
  items: any[];
  emptyMessage: string;
  renderItem: (item: any) => React.ReactNode;
}

function AlertSection({
  icon: Icon,
  title,
  color,
  items,
  emptyMessage,
  renderItem,
}: AlertSectionProps) {
  const colorClasses = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          <Icon size={20} className="text-current" />
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          {items.length > 0 && (
            <span className={`text-sm font-semibold px-2 py-1 rounded-full border ${colorClasses[color]}`}>
              {items.length}
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-2 py-8 text-stone-500">
          <CheckCircle size={16} />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
