'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  Clock,
  CreditCard,
  Shield,
  Truck,
  Wifi,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Purchase {
  id: string;
  item_name: string;
  price: number;
  purchase_date: string;
  category: string;
  store_name: string;
  return_deadline: string;
}

interface Subscription {
  id: string;
  name: string;
  cost: number;
  renewal_date: string;
  status: string;
}

interface Warranty {
  id: string;
  product_name: string;
  expiration_date: string;
  status: string;
}

interface Delivery {
  id: string;
  order_name: string;
  expected_date: string;
  status: string;
}

const recoveryChannels = [
  {
    id: 'price-drops',
    name: 'Price Drops',
    icon: TrendingDown,
    color: 'amber',
    href: '/dashboard/purchases',
  },
  {
    id: 'return-deadlines',
    name: 'Return Deadlines',
    icon: Clock,
    color: 'amber',
    href: '/dashboard/purchases',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: CreditCard,
    color: 'amber',
    href: '/dashboard/subscriptions',
  },
  {
    id: 'warranties',
    name: 'Warranties',
    icon: Shield,
    color: 'amber',
    href: '/dashboard/warranties',
  },
  {
    id: 'late-deliveries',
    name: 'Late Deliveries',
    icon: Truck,
    color: 'amber',
    href: '/dashboard/deliveries',
  },
  {
    id: 'outage-credits',
    name: 'Outage Credits',
    icon: Wifi,
    color: 'amber',
    href: '/dashboard/outages',
  },
];

interface RecoveryStats {
  totalRecovered: number;
  pendingRecovery: number;
  activeTracking: number;
  alerts: number;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<RecoveryStats>({
    totalRecovered: 0,
    pendingRecovery: 0,
    activeTracking: 0,
    alerts: 0,
  });
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({
    'price-drops': 0,
    'return-deadlines': 0,
    subscriptions: 0,
    warranties: 0,
    'late-deliveries': 0,
    'outage-credits': 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch purchases
        const { data: purchases } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id);

        // Fetch subscriptions
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);

        // Fetch warranties
        const { data: warranties } = await supabase
          .from('warranties')
          .select('*')
          .eq('user_id', user.id);

        // Fetch deliveries
        const { data: deliveries } = await supabase
          .from('deliveries')
          .select('*')
          .eq('user_id', user.id);

        // Calculate stats
        const now = new Date();
        let priceDrops = 0;
        let returnDeadlines = 0;
        let lateDeliveries = 0;

        if (purchases) {
          const purchaseList = purchases as Purchase[];
          priceDrops = purchaseList.filter(
            (p) => p.category === 'Electronics'
          ).length;

          returnDeadlines = purchaseList.filter((p) => {
            const deadline = new Date(p.return_deadline);
            return deadline > now;
          }).length;
        }

        if (deliveries) {
          const deliveryList = deliveries as Delivery[];
          lateDeliveries = deliveryList.filter(
            (d) => d.status !== 'delivered'
          ).length;
        }

        const subscriptionCount = subscriptions?.length || 0;
        const warrantyCount = warranties?.length || 0;
        const outageCount = 0; // Would be calculated from another table

        setChannelCounts({
          'price-drops': priceDrops,
          'return-deadlines': returnDeadlines,
          subscriptions: subscriptionCount,
          warranties: warrantyCount,
          'late-deliveries': lateDeliveries,
          'outage-credits': outageCount,
        });

        setStats({
          totalRecovered: 0, // Would be calculated from completed refunds
          pendingRecovery: 0, // Would be calculated from pending refunds
          activeTracking: (purchases?.length || 0) + subscriptionCount,
          alerts:
            returnDeadlines + lateDeliveries + warrantyCount + outageCount,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white mb-1">
          Welcome back
        </h1>
        <p className="text-stone-400">{dateStr}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Recovered"
          value={`$${stats.totalRecovered.toFixed(2)}`}
          color="emerald"
        />
        <StatCard
          label="Pending Recovery"
          value={`$${stats.pendingRecovery.toFixed(2)}`}
          color="amber"
        />
        <StatCard
          label="Active Tracking"
          value={stats.activeTracking.toString()}
          color="blue"
        />
        <StatCard
          label="Alerts"
          value={stats.alerts.toString()}
          color="red"
        />
      </div>

      {/* Recovery Channels */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Recovery Channels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recoveryChannels.map((channel) => {
            const Icon = channel.icon;
            const count = channelCounts[channel.id] || 0;
            return (
              <Link
                key={channel.id}
                href={channel.href}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg group-hover:bg-amber-500/15 transition">
                    <Icon className="text-amber-400" size={24} />
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1">
                  {channel.name}
                </h3>
                <p className="text-stone-400 text-sm mb-2">
                  {count} {count === 1 ? 'item' : 'items'}
                </p>
                <p className="text-stone-500 text-sm">
                  0 opportunities
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Activity
        </h2>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center">
          <p className="text-stone-400 mb-4">
            No activity yet. Start by adding a purchase.
          </p>
          <Link
            href="/dashboard/purchases"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-semibold px-6 py-2 transition"
          >
            Add your first purchase
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: 'emerald' | 'amber' | 'blue' | 'red';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    red: 'bg-red-500/10 border-red-500/20',
  };

  const textClasses = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
  };

  return (
    <div
      className={`border rounded-2xl p-6 ${colorClasses[color]}`}
    >
      <p className="text-stone-400 text-sm font-medium mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${textClasses[color]}`}>
        {value}
      </p>
    </div>
  );
}
