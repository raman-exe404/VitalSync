const colors = {
  LOW: 'bg-green-100 text-green-700 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  HIGH: 'bg-red-100 text-red-700 border-red-300'
};

const icons = { LOW: '✅', MEDIUM: '⚠️', HIGH: '🚨' };

export default function RiskBadge({ level }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border font-bold text-sm ${colors[level] || colors.LOW}`}>
      {icons[level]} {level}
    </span>
  );
}
