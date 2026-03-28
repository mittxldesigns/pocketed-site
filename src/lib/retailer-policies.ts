export const RETAILER_POLICIES: Record<
  string,
  {
    name: string
    standardDays: number
    electronicsDays: number
    receiptRequired: boolean
    conditions: string
  }
> = {
  amazon: {
    name: 'Amazon',
    standardDays: 30,
    electronicsDays: 15,
    receiptRequired: false,
    conditions: 'Items must be unused and in original condition. Opened electronics have restricted return window.',
  },
  target: {
    name: 'Target',
    standardDays: 90,
    electronicsDays: 90,
    receiptRequired: false,
    conditions: 'Items must be in resellable condition. Most items returnable within 90 days.',
  },
  bestbuy: {
    name: 'Best Buy',
    standardDays: 15,
    electronicsDays: 15,
    receiptRequired: false,
    conditions: 'Electronics and appliances have 15-day return window. Some exclusions apply.',
  },
  walmart: {
    name: 'Walmart',
    standardDays: 90,
    electronicsDays: 30,
    receiptRequired: false,
    conditions: 'Most items returnable within 90 days. Electronics have 30-day window.',
  },
  apple: {
    name: 'Apple',
    standardDays: 14,
    electronicsDays: 14,
    receiptRequired: false,
    conditions: 'Products must be unused in original packaging. 14-day return policy for all products.',
  },
  nike: {
    name: 'Nike',
    standardDays: 60,
    electronicsDays: 60,
    receiptRequired: false,
    conditions: 'Shoes and apparel returnable within 60 days. Items must be unworn and unwashed.',
  },
  homedepot: {
    name: 'Home Depot',
    standardDays: 90,
    electronicsDays: 90,
    receiptRequired: false,
    conditions: 'Most items returnable within 90 days. Some restrictions on power tools and clearance items.',
  },
  costco: {
    name: 'Costco',
    standardDays: -1,
    electronicsDays: 90,
    receiptRequired: false,
    conditions: 'Unlimited return policy on most items. Electronics have 90-day return window.',
  },
  nordstrom: {
    name: 'Nordstrom',
    standardDays: 45,
    electronicsDays: 45,
    receiptRequired: false,
    conditions: 'Generous 45-day return policy. No time limits on some luxury items.',
  },
  sephora: {
    name: 'Sephora',
    standardDays: 30,
    electronicsDays: 30,
    receiptRequired: false,
    conditions: 'Beauty products returnable within 30 days in original condition with receipt.',
  },
  macys: {
    name: "Macy's",
    standardDays: 60,
    electronicsDays: 60,
    receiptRequired: false,
    conditions: 'Most merchandise returnable within 60 days. Electronics have standard return window.',
  },
  rei: {
    name: 'REI',
    standardDays: 365,
    electronicsDays: 365,
    receiptRequired: false,
    conditions: 'One-year return policy on most items. REI Co-op members have extended returns on used gear.',
  },
  lowes: {
    name: "Lowe's",
    standardDays: 90,
    electronicsDays: 90,
    receiptRequired: false,
    conditions: 'Most items returnable within 90 days. Some exceptions on clearance and special order items.',
  },
  staples: {
    name: 'Staples',
    standardDays: 30,
    electronicsDays: 30,
    receiptRequired: false,
    conditions: 'Office supplies and electronics returnable within 30 days of purchase.',
  },
  kohls: {
    name: "Kohl's",
    standardDays: 90,
    electronicsDays: 90,
    receiptRequired: false,
    conditions: 'Most items returnable within 90 days. Clearance items are final sale.',
  },
  gap: {
    name: 'Gap',
    standardDays: 45,
    electronicsDays: 45,
    receiptRequired: false,
    conditions: 'Clothing and accessories returnable within 45 days. Items must have tags attached.',
  },
  oldnavy: {
    name: 'Old Navy',
    standardDays: 45,
    electronicsDays: 45,
    receiptRequired: false,
    conditions: 'Most items returnable within 45 days. Online purchases can be returned in-store.',
  },
  ikea: {
    name: 'IKEA',
    standardDays: 365,
    electronicsDays: 365,
    receiptRequired: false,
    conditions: 'Furniture and items returnable within 365 days. Must be in resellable condition.',
  },
  traderjoes: {
    name: "Trader Joe's",
    standardDays: -1,
    electronicsDays: -1,
    receiptRequired: false,
    conditions: 'No questions asked return policy. All items returnable at any time.',
  },
  wholefoods: {
    name: 'Whole Foods',
    standardDays: 30,
    electronicsDays: 30,
    receiptRequired: false,
    conditions: 'Most items returnable within 30 days. Prime members may have extended benefits.',
  },
}
