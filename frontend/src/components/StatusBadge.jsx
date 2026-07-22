import { statusLabel } from '../constants';
const colors={new:'bg-ice/10 text-ice',contacted:'bg-amber-300/10 text-amber-200',reviewing:'bg-violet-300/10 text-violet-200',approved:'bg-success/10 text-success',rejected:'bg-danger/10 text-danger'};
export default function StatusBadge({status}){return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${colors[status]||''}`}>{statusLabel(status)}</span>}
