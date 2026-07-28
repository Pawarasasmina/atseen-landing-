import { useCallback, useEffect, useState } from 'react';
import { Eye, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { categories, statuses, statusLabel } from '../constants';

const initial = { search: '', status: '', category: '', country: '', dateFrom: '', dateTo: '' };

export default function Leads() {
  const [filters, setFilters] = useState(initial);
  const [query, setQuery] = useState(initial);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(() => {
    setError(false);
    api.get('/admin/leads', { params: { ...query, page, limit: 20, sort: '-submittedAt' } })
      .then((response) => setData(response.data))
      .catch(() => setError(true));
  }, [query, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    document.body.classList.toggle('admin-filters-open', filtersOpen);
    return () => document.body.classList.remove('admin-filters-open');
  }, [filtersOpen]);

  const search = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(filters);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters(initial);
    setQuery(initial);
    setPage(1);
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/admin/leads/${id}/status`, { status });
      toast.success('Status updated');
      load();
    } catch { toast.error('Could not update status'); }
  };

  const remove = async (lead) => {
    if (!window.confirm(`Permanently delete ${lead.fullName}'s lead? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/leads/${lead._id}`);
      toast.success('Lead deleted');
      load();
    } catch { toast.error('Could not delete lead'); }
  };

  const filterForm = (
    <form onSubmit={search} className={`lead-filters panel ${filtersOpen ? 'lead-filters-open' : ''}`}>
      <div className="lead-filters-head">
        <div><p>Refine results</p><h2>Filters</h2></div>
        <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={20} /></button>
      </div>
      <label className="lead-search-wrap relative md:col-span-2">
        <Search className="lead-search-icon text-white/30" size={17} />
        <input aria-label="Search leads" className="field lead-search-input" placeholder="Name, email, phone or URL" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
      </label>
      <select aria-label="Filter status" className="field" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
        <option value="">All statuses</option>{statuses.map((status) => <option value={status} key={status}>{statusLabel(status)}</option>)}
      </select>
      <select aria-label="Filter category" className="field" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
        <option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}
      </select>
      <input aria-label="Filter country" className="field" placeholder="Country" value={filters.country} onChange={(event) => setFilters({ ...filters, country: event.target.value })} />
      <label className="lead-date-field"><span>From</span><input aria-label="From date" type="date" className="field" value={filters.dateFrom} onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })} /></label>
      <label className="lead-date-field"><span>To</span><input aria-label="To date" type="date" className="field" value={filters.dateTo} onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })} /></label>
      <div className="lead-filter-actions">
        <button className="btn btn-primary"><Search size={17} /> <span>Apply filters</span></button>
        <button type="button" onClick={clearFilters} className="btn btn-secondary"><X size={17} /> <span>Clear</span></button>
      </div>
    </form>
  );

  return <>
    <div className="leads-page-heading">
      <div><p className="text-xs uppercase tracking-[.18em] text-ice">Management</p><h1>Creator leads</h1></div>
      <button type="button" className="mobile-filter-button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={18} /> Filters</button>
    </div>
    {filtersOpen && <button className="lead-filter-backdrop" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />}
    {filterForm}
    <div className="lead-results-count"><p>{data ? `${data.pagination.total} result${data.pagination.total === 1 ? '' : 's'}` : 'Loading…'}</p></div>
    <section className="panel leads-results-panel">
      {error ? <div className="p-8 text-center text-danger">Leads could not be loaded. <button onClick={load} className="underline">Try again</button></div>
        : !data ? <div className="space-y-2 p-4">{Array.from({ length: 6 }, (_, index) => <div className="h-16 animate-pulse rounded-xl bg-white/[.04]" key={index} />)}</div>
          : data.leads.length === 0 ? <div className="p-16 text-center"><UsersEmpty /><p className="mt-4 text-white/45">No creator leads match these filters.</p></div>
            : <>
              <div className="lead-mobile-list">{data.leads.map((lead) => <LeadCard lead={lead} changeStatus={changeStatus} remove={remove} key={lead._id} />)}</div>
              <div className="lead-desktop-table"><table className="w-full min-w-[1160px] text-left text-sm">
                <thead className="border-b border-white/[.07] text-xs uppercase tracking-wider text-white/35"><tr>{['Creator', 'Contact', 'Category', 'Country', 'Audience', 'Referral', 'Status', 'Submitted', 'Actions'].map((heading) => <th className="p-4" key={heading}>{heading}</th>)}</tr></thead>
                <tbody>{data.leads.map((lead) => <tr className="border-b border-white/[.04] hover:bg-white/[.015]" key={lead._id}>
                  <td className="p-4 font-medium">{lead.fullName}</td><td className="p-4"><p>{lead.email}</p><p className="text-xs text-white/35">{lead.phone || '—'}</p></td>
                  <td className="p-4 text-white/55">{lead.creatorCategory}</td><td className="p-4 text-white/55">{lead.country}</td><td className="p-4 text-white/55">{lead.audienceSize || '—'}</td>
                  <td className="p-4">{lead.referredBy ? <Link to={`/admin/leads/${lead.referredBy._id}`} className="text-ice hover:underline">{lead.referredBy.fullName}<span className="mt-1 block text-xs text-white/35">Referred</span></Link> : <span className="text-white/35">Direct</span>}</td>
                  <td className="p-4"><StatusSelect lead={lead} changeStatus={changeStatus} /></td><td className="p-4 text-white/45">{new Date(lead.submittedAt).toLocaleDateString()}</td>
                  <td className="p-4"><LeadActions lead={lead} remove={remove} /></td>
                </tr>)}</tbody>
              </table></div>
            </>}
    </section>
    {data?.pagination.pages > 1 && <div className="lead-pagination"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="btn btn-secondary disabled:opacity-30">Previous</button><span>Page {page} of {data.pagination.pages}</span><button disabled={page === data.pagination.pages} onClick={() => setPage((current) => current + 1)} className="btn btn-secondary disabled:opacity-30">Next</button></div>}
  </>;
}

function StatusSelect({ lead, changeStatus }) {
  return <select aria-label={`Change ${lead.fullName} status`} value={lead.status} onChange={(event) => changeStatus(lead._id, event.target.value)} className="lead-status-select">{statuses.map((status) => <option value={status} key={status}>{statusLabel(status)}</option>)}</select>;
}
function LeadActions({ lead, remove }) {
  return <div className="lead-actions"><Link to={`/admin/leads/${lead._id}`} title="View details"><Eye size={17} /></Link><button onClick={() => remove(lead)} title="Delete lead"><Trash2 size={17} /></button></div>;
}
function LeadCard({ lead, changeStatus, remove }) {
  return <article className="lead-mobile-card">
    <div className="lead-card-top"><div><h2>{lead.fullName}</h2><p>{new Date(lead.submittedAt).toLocaleDateString()}</p></div><StatusSelect lead={lead} changeStatus={changeStatus} /></div>
    <div className="lead-card-contact"><a href={`mailto:${lead.email}`}>{lead.email}</a><span>{lead.phone || 'No phone'}</span></div>
    <dl><div><dt>Category</dt><dd>{lead.creatorCategory}</dd></div><div><dt>Location</dt><dd>{lead.country || '—'}</dd></div><div><dt>Audience</dt><dd>{lead.audienceSize || '—'}</dd></div><div><dt>Source</dt><dd>{lead.referredBy ? 'Referred' : 'Direct'}</dd></div></dl>
    <LeadActions lead={lead} remove={remove} />
  </article>;
}
function UsersEmpty() { return <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/[.04] text-white/30"><Search /></div>; }