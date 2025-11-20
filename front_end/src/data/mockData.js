export const userProfile = {
  name: "User",
  greeting: "Good morning",
  totalBalance: 285750,
  totalProfit: 5715,
};

export const pendingWithdrawals = [
  {
    id: "REQ-4098",
    amount: 45000,
    status: "Awaiting approver",
    method: "MTN Mobile Money",
  },
  {
    id: "REQ-4107",
    amount: 120000,
    status: "Under review",
    method: "Bank Transfer",
  },
];

export const stats = {
  deposits: 24,
  withdrawals: 6,
  transfers: 14,
  pending: pendingWithdrawals.length,
};

export const transactions = [
  {
    id: "TXN-1",
    type: "deposit",
    label: "Salary",
    amount: 150000,
    date: "Today, 09:15",
  },
  {
    id: "TXN-2",
    type: "withdraw",
    label: "School Fees",
    amount: -45000,
    date: "Yesterday, 14:30",
  },
  {
    id: "TXN-3",
    type: "transfer",
    label: "Mom",
    amount: -20000,
    date: "Mon, 19:11",
  },
  {
    id: "TXN-4",
    type: "deposit",
    label: "Side Hustle",
    amount: 35000,
    date: "Mon, 08:05",
  },
  {
    id: "TXN-5",
    type: "pending",
    label: "Emergency Fund",
    amount: -70000,
    date: "Sun, 18:50",
  },
];

export const goals = [
  {
    id: "goal-1",
    title: "New Motorcycle",
    targetAmount: 900000,
    savedAmount: 350000,
    deadline: "Dec 2025",
  },
  {
    id: "goal-2",
    title: "Tuition",
    targetAmount: 450000,
    savedAmount: 280000,
    deadline: "Sep 2025",
  },
];

export const paymentMethods = [
  { id: "mtn", label: "MTN Mobile Money", hint: "**** **** 1234" },
  { id: "airtel", label: "Airtel Money", hint: "**** **** 5678" },
  { id: "bank", label: "Bank Transfer", hint: "BK **** 9012" },
];

export const feeTiers = [
  { max: 1000, fee: 0 },
  { max: 5000, fee: 50 },
  { max: 15000, fee: 100 },
  { max: 50000, fee: 200 },
  { max: 200000, fee: 400 },
  { max: Infinity, fee: 600 },
];

export const termsSections = [
  {
    title: "🏦 AGASEKE Digital Piggy Bank",
    lines: [
      "Secure savings with built-in withdrawal protection.",
      "Designed for disciplined savers across Rwanda.",
    ],
  },
  {
    title: "💰 Fee Structure",
    lines: [
      "Deposits: FREE",
      "Withdrawals: 2% service fee on all amounts",
      "Transfers: tiered fees based on total sent per transaction.",
    ],
  },
  {
    title: "🔒 Withdrawal Protection System",
    lines: [
      "All withdrawals require approval from a trusted partner.",
      "Emergency withdrawals include extra verification for safety.",
    ],
  },
  {
    title: "📱 Supported Payment Methods",
    lines: ["MTN Mobile Money", "Airtel Money", "All major Rwandan banks"],
  },
  {
    title: "🛡️ Security & Privacy",
    lines: [
      "Bank-level encryption protects every transaction.",
      "24/7 monitoring for fraud and suspicious activity.",
    ],
  },
  {
    title: "📞 Contact Information",
    lines: [
      "Customer Service: +250 786 739 043",
      "Email: anthonyregina48@gmail.com",
    ],
  },
];

export const pricingInfo = {
  hero: "Your digital piggy bank, now on native mobile.",
  tiers: [
    {
      title: "East Africa",
      price: "FREE",
      regions: "Rwanda, Uganda, Kenya, Tanzania, Burundi, South Sudan",
    },
    { title: "Africa", price: "$2.99", regions: "All other African countries" },
    {
      title: "Developing Countries",
      price: "$4.99",
      regions: "Asia (except Japan/Singapore), Latin America, Eastern Europe",
    },
    {
      title: "Developed Countries",
      price: "$9.99",
      regions: "North America, Western Europe, Australia, Japan, Singapore",
    },
  ],
  features: [
    "Native iOS & Android apps",
    "Push notifications for every transaction",
    "Advanced analytics and insights",
    "Enhanced withdrawal security",
    "Offline transaction capability",
  ],
};
