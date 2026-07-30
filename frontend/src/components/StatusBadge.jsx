import { statusLabel } from '../constants';
const colors={new:'bg-ice/10 text-ice',reviewing:'bg-cyan-300/10 text-cyan-200',shortlisted:'bg-amber-300/10 text-amber-200',waitlisted:'bg-orange-300/10 text-orange-200',invited:'bg-violet-300/10 text-violet-200',rejected:'bg-danger/10 text-danger'};
export default function StatusBadge({status}){return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${colors[status]||''}`}>{statusLabel(status)}</span>}
