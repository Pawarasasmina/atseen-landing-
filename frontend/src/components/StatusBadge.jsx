import { statusLabel } from '../constants';
const colors={new:'bg-ice/10 text-ice',shortlisted:'bg-amber-300/10 text-amber-200',invited:'bg-violet-300/10 text-violet-200',registered:'bg-success/10 text-success'};
export default function StatusBadge({status}){return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${colors[status]||''}`}>{statusLabel(status)}</span>}
