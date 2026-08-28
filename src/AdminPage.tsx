import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  FileText,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Wifi,
  UploadCloud,
} from "lucide-react";
import AppHeader from "./AppHeader";
import {
  AutomationStatus,
  Company,
  PendingReviewItem,
  UploadedReport,
  applyExtractionDraft,
  approveReviewItem,
  createGptReportExtractionDraft,
  createManualExtractionDraft,
  createReportExtractionDraft,
  deleteReport,
  extractReportText,
  loadAutomationStatus,
  loadCompanies,
  loadExtractionDrafts,
  loadPendingReview,
  loadReports,
  runAutomationNow,
  toUserMessage,
  uploadReport,
} from "./api";

type DraftSummary = Awaited<ReturnType<typeof loadExtractionDrafts>>[number];

function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [pending, setPending] = useState<PendingReviewItem[]>([]);
  const [automation, setAutomation] = useState<AutomationStatus | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [reportYear, setReportYear] = useState(() => String(new Date().getFullYear() - 1));
  const [reportName, setReportName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [manualReportId, setManualReportId] = useState("");
  const [manualText, setManualText] = useState("");
  const [manualSourceName, setManualSourceName] = useState("");
  const [manualYear, setManualYear] = useState(() => String(new Date().getFullYear() - 1));
  const [manualNotes, setManualNotes] = useState("");
  const [isCreatingManualDraft, setIsCreatingManualDraft] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setIsLoading(true);
    setError("");
    try {
      const [companyData, reportData, draftData, pendingData, automationData] = await Promise.all([
        loadCompanies(),
        loadReports(200),
        loadExtractionDrafts(200),
        loadPendingReview(200),
        loadAutomationStatus().catch(() => null),
      ]);
      setCompanies(companyData);
      setReports(reportData);
      setDrafts(draftData);
      setPending(pendingData);
      setAutomation(automationData);
      setSelectedSymbol((current) => current || companyData[0]?.symbol || "");
    } catch (err) {
      setError(toUserMessage(err, "Unable to load admin dashboard. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  const companyById = useMemo(() => new Map(companies.map((company) => [company.id, company])), [companies]);
  const selectedCompany = companies.find((company) => company.symbol === selectedSymbol);
  const reportYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, index) => String(currentYear - index));
  }, []);

  const visibleReports = reports
    .filter((report) => {
      const company = report.company_id ? companyById.get(report.company_id) : null;
      return !selectedSymbol || company?.symbol === selectedSymbol;
    })
    .filter((report) => {
      const normalized = query.trim().toLowerCase();
      const company = report.company_id ? companyById.get(report.company_id) : null;
      return (
        !normalized ||
        report.original_filename.toLowerCase().includes(normalized) ||
        report.status.toLowerCase().includes(normalized) ||
        company?.symbol.toLowerCase().includes(normalized)
      );
    });

  const selectedPending = pending.filter((item) => !selectedSymbol || item.symbol === selectedSymbol);
  const selectedManualReport = reports.find((report) => String(report.id) === manualReportId);
  const standaloneDrafts = drafts.filter((draft) => {
    const normalized = query.trim().toLowerCase();
    const belongsToCompany = !selectedCompany || draft.company_id === selectedCompany.id;
    const matchesSearch =
      !normalized ||
      `${draft.id} ${draft.status} ${draft.notes || ""}`.toLowerCase().includes(normalized);
    return !draft.uploaded_report_id && belongsToCompany && matchesSearch;
  });

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSymbol || !file) {
      setError("Choose a company and select a PDF report first.");
      return;
    }

    setIsUploading(true);
    setError("");
    setMessage("");
    try {
      const uploaded = await uploadReport({
        symbol: selectedSymbol,
        name: reportName || `${selectedSymbol} ${reportYear} Annual Report`,
        documentType: "financial_report",
        notes: [`Financial year: ${reportYear}`, notes].filter(Boolean).join(". "),
        file,
      });
      setMessage(`Uploaded report #${uploaded.id}. Next step: extract text or paste manual financial text.`);
      setManualReportId(String(uploaded.id));
      setManualYear(reportYear);
      setReportName("");
      setNotes("");
      setFile(null);
      await loadAdminData();
    } catch (err) {
      setError(toUserMessage(err, "Unable to upload report. Please check the PDF and try again."));
    } finally {
      setIsUploading(false);
    }
  }

  async function submitManualDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSymbol || !manualText.trim()) {
      setError("Choose a company and paste the financial statement text first.");
      return;
    }
    if (!selectedManualReport && (!manualSourceName.trim() || !manualYear)) {
      setError("Enter a source name and financial year when no uploaded report is linked.");
      return;
    }

    setIsCreatingManualDraft(true);
    setError("");
    setMessage("");
    try {
      const draft = await createManualExtractionDraft({
        symbol: selectedSymbol,
        sourceDocumentId: selectedManualReport?.source_document_id,
        uploadedReportId: selectedManualReport?.id,
        sourceName: selectedManualReport ? undefined : manualSourceName.trim(),
        reportYear: selectedManualReport ? undefined : Number(manualYear),
        reportText: manualText,
        notes:
          manualNotes ||
          `Manual financial text pasted for ${selectedSymbol} ${manualYear} annual report.`,
      });
      setMessage(`Manual DeepSeek draft #${draft.id} created. Review it before applying.`);
      setManualSourceName("");
      setManualText("");
      setManualNotes("");
      await loadAdminData();
    } catch (err) {
      setError(toUserMessage(err, "Unable to create manual extraction draft. Please review the pasted text and try again."));
    } finally {
      setIsCreatingManualDraft(false);
    }
  }

  async function runAction(label: string, action: () => Promise<unknown>) {
    setBusyAction(label);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(`${label} completed successfully.`);
      await loadAdminData();
    } catch (err) {
      setError(toUserMessage(err, `${label} could not finish. Please try again.`));
    } finally {
      setBusyAction("");
    }
  }

  async function confirmDeleteReport(report: UploadedReport) {
    const confirmed = window.confirm(
      `Delete report #${report.id} (${report.original_filename})? This also removes its text extractions and drafts.`,
    );
    if (!confirmed) {
      return;
    }
    await runAction(`Delete report #${report.id}`, async () => {
      await deleteReport(report.id);
      if (manualReportId === String(report.id)) {
        setManualReportId("");
      }
    });
  }

  return (
    <main className="admin-page">
      <AppHeader />

      <section className="admin-layout">
        <div className="admin-main">
          <div className="desk-heading">
            <div>
              <p className="eyebrow">Admin Dashboard</p>
              <h1>Annual report intake and review pipeline.</h1>
            </div>
            <button className="mini-refresh" onClick={loadAdminData} type="button">
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {isLoading && (
            <div className="state-panel">
              <LoaderCircle className="spin" size={24} />
              Loading admin workspace...
            </div>
          )}

          {error && (
            <div className="state-panel error-state">
              <AlertTriangle size={24} />
              {error}
            </div>
          )}

          {message && (
            <div className="state-panel success-state">
              <CheckCircle2 size={24} />
              {message}
            </div>
          )}

          {!isLoading && (
            <>
              <div className="admin-stat-grid">
                <AdminStat label="Companies" value={String(companies.length)} />
                <AdminStat label="Uploaded reports" value={String(reports.length)} />
                <AdminStat label="Extraction drafts" value={String(drafts.length)} />
                <AdminStat label="Pending review" value={String(pending.length)} />
              </div>

              <section className="admin-upload-panel starter-sync-panel">
                <div className="admin-form-header">
                  <Wifi size={24} />
                  <div>
                    <h2>Automatic market intelligence</h2>
                    <p>
                      EquityKobo runs NGX Pulse market data, fundamentals, context feeds, dividend histories,
                      scans, and alerts automatically in the backend.
                    </p>
                  </div>
                </div>

                <div className="automation-grid">
                  <AdminStat label="Enabled" value={automation?.enabled ? "Yes" : "No"} />
                  <AdminStat label="Running" value={automation?.is_running ? "Yes" : "No"} />
                  <AdminStat label="Interval" value={`${automation?.interval_minutes ?? 0} min`} />
                  <AdminStat label="Runs" value={String(automation?.runs ?? 0)} />
                </div>

                <div className="automation-summary">
                  <p>
                    Current step: <strong>{formatAutomationStep(automation)}</strong>
                  </p>
                  <p>
                    Last started: <strong>{formatDateTime(automation?.last_started_at)}</strong>
                  </p>
                  <p>
                    Last finished: <strong>{formatDateTime(automation?.last_finished_at)}</strong>
                  </p>
                  <p>
                    Last result: <strong>{formatAutomationResult(automation?.last_result)}</strong>
                  </p>
                  {automation?.last_error && (
                    <p className="danger-copy">{formatAutomationError(automation.last_error)}</p>
                  )}
                </div>

                <button
                  className="icon-text-button light"
                  disabled={Boolean(busyAction) || automation?.is_running}
                  onClick={() => runAction("Run automatic market intelligence", runAutomationNow)}
                  type="button"
                >
                  <RefreshCw size={17} />
                  Run now
                </button>
              </section>

              <form className="admin-upload-panel" onSubmit={submitUpload}>
                <div className="admin-form-header">
                  <UploadCloud size={24} />
                  <div>
                    <h2>Upload annual report</h2>
                    <p>Select a company, attach the PDF, then run extraction from the report list.</p>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <label>
                    Company
                    <select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)}>
                      {companies.map((company) => (
                        <option key={company.id} value={company.symbol}>
                          {company.symbol} - {company.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Report year
                    <select value={reportYear} onChange={(event) => setReportYear(event.target.value)}>
                      {reportYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Report name
                    <input
                      placeholder={`${selectedSymbol || "GTCO"} ${reportYear} Annual Report`}
                      value={reportName}
                      onChange={(event) => setReportName(event.target.value)}
                    />
                  </label>
                  <label>
                    Source note
                    <input
                      placeholder="Official investor relations page"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </label>
                  <label>
                    PDF file
                    <input accept="application/pdf" onChange={onFileChange} type="file" />
                  </label>
                </div>

                <button className="button" disabled={isUploading || !file || !selectedSymbol} type="submit">
                  {isUploading ? <LoaderCircle className="spin" size={18} /> : <UploadCloud size={18} />}
                  Upload report
                </button>
              </form>

              <form className="admin-upload-panel manual-draft-panel" onSubmit={submitManualDraft}>
                <div className="admin-form-header">
                  <DatabaseZap size={24} />
                  <div>
                    <h2>Manual financial text</h2>
                    <p>
                      Paste the exact statement pages when automatic report detection struggles. Keep the
                      uploaded PDF linked for source review.
                    </p>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <label>
                    Linked report
                    <select value={manualReportId} onChange={(event) => setManualReportId(event.target.value)}>
                      <option value="">No uploaded report selected</option>
                      {visibleReports.map((report) => (
                        <option key={report.id} value={report.id}>
                          Report #{report.id} - {report.original_filename}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Source name
                    <input
                      placeholder="GTCO annual report"
                      value={manualSourceName}
                      onChange={(event) => setManualSourceName(event.target.value)}
                    />
                  </label>
                  <label>
                    Financial year
                    <select value={manualYear} onChange={(event) => setManualYear(event.target.value)}>
                      {reportYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Manual note
                    <input
                      placeholder="Copied consolidated statements from pages 130-134"
                      value={manualNotes}
                      onChange={(event) => setManualNotes(event.target.value)}
                    />
                  </label>
                </div>

                <label className="manual-text-field">
                  Financial statement text
                  <textarea
                    placeholder="Paste statement of profit or loss, statement of financial position, cash flows, EPS/dividend notes..."
                    value={manualText}
                    onChange={(event) => setManualText(event.target.value)}
                  />
                </label>

                <button
                  className="button"
                  disabled={
                    isCreatingManualDraft ||
                    !selectedSymbol ||
                    manualText.trim().length < 80 ||
                    (!selectedManualReport && (!manualSourceName.trim() || !manualYear))
                  }
                  type="submit"
                >
                  {isCreatingManualDraft ? <LoaderCircle className="spin" size={18} /> : <DatabaseZap size={18} />}
                  Create manual draft
                </button>
              </form>

              {standaloneDrafts.length > 0 && (
                <div className="admin-section">
                  <div className="admin-section-head">
                    <div>
                      <p className="eyebrow">Manual draft queue</p>
                      <h2>Standalone drafts ready for review</h2>
                    </div>
                  </div>

                  <div className="draft-list standalone-draft-list">
                    {standaloneDrafts.map((draft) => {
                      const periodEnd =
                        typeof draft.parsed_data?.period_end === "string"
                          ? draft.parsed_data.period_end
                          : "Unknown period";
                      const dividend =
                        draft.parsed_data?.dividend_per_share ??
                        (Array.isArray(draft.parsed_data?.dividends)
                          ? draft.parsed_data.dividends[0]?.amount_per_share
                          : null);
                      return (
                        <div key={draft.id}>
                          <span>Draft #{draft.id}</span>
                          <strong>{draft.status}</strong>
                          <small>
                            {periodEnd}
                            {dividend ? ` · dividend ${String(dividend)}` : ""}
                          </small>
                          <button
                            className="text-action"
                            disabled={Boolean(busyAction) || draft.status === "applied"}
                            onClick={() => runAction(`Apply draft #${draft.id}`, () => applyExtractionDraft(draft.id))}
                            type="button"
                          >
                            Apply
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <p className="eyebrow">Report queue</p>
                    <h2>{selectedCompany ? selectedCompany.name : "Uploaded reports"}</h2>
                  </div>
                  <label className="desk-search">
                    <Search size={18} />
                    <input
                      placeholder="Search report, status, symbol"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </label>
                </div>

                {visibleReports.length === 0 ? (
                  <div className="state-panel">No reports uploaded for this company yet.</div>
                ) : (
                  <div className="admin-report-list">
                    {visibleReports.map((report) => {
                      const company = report.company_id ? companyById.get(report.company_id) : null;
                      const reportDrafts = drafts.filter((draft) => draft.uploaded_report_id === report.id);
                      const hasLinkedDraft = reportDrafts.length > 0;
                      return (
                        <article className="admin-report-card" key={report.id}>
                          <div>
                            <span className="status-pill">{report.status}</span>
                            <h3>{report.original_filename}</h3>
                            <p>
                              {company?.symbol || "Unknown"} · report #{report.id} · source #
                              {report.source_document_id} · {formatFileSize(report.file_size)}
                            </p>
                          </div>
                          <div className="admin-card-actions">
                            <button
                              className="icon-text-button light"
                              disabled={Boolean(busyAction)}
                              onClick={() =>
                                runAction(`Extract text for report #${report.id}`, () => extractReportText(report.id))
                              }
                              type="button"
                            >
                              <FileText size={17} />
                              Extract text
                            </button>
                            <button
                              className="icon-text-button light"
                              disabled={Boolean(busyAction) || hasLinkedDraft}
                              onClick={() =>
                                runAction(`Create GPT draft for report #${report.id}`, () =>
                                  createGptReportExtractionDraft(report.id),
                                )
                              }
                              type="button"
                            >
                              <Sparkles size={17} />
                              GPT draft
                            </button>
                            <button
                              className="icon-text-button light"
                              disabled={Boolean(busyAction) || hasLinkedDraft}
                              onClick={() =>
                                runAction(`Create draft for report #${report.id}`, () =>
                                  createReportExtractionDraft(report.id),
                                )
                              }
                              type="button"
                            >
                              <DatabaseZap size={17} />
                              {hasLinkedDraft ? "Draft ready" : "DeepSeek draft"}
                            </button>
                            <button
                              className="icon-text-button danger-light"
                              disabled={Boolean(busyAction)}
                              onClick={() => confirmDeleteReport(report)}
                              type="button"
                            >
                              <Trash2 size={17} />
                              Delete
                            </button>
                          </div>
                          {reportDrafts.length > 0 && (
                            <div className="draft-list">
                              {reportDrafts.map((draft) => (
                                <div key={draft.id}>
                                  <span>Draft #{draft.id}</span>
                                  <strong>{draft.status}</strong>
                                  <button
                                    className="text-action"
                                    disabled={Boolean(busyAction) || draft.status === "applied"}
                                    onClick={() =>
                                      runAction(`Apply draft #${draft.id}`, () => applyExtractionDraft(draft.id))
                                    }
                                    type="button"
                                  >
                                    Apply
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="admin-aside">
          <div className="decision-panel">
            <p className="eyebrow">Pending review</p>
            <h2>Approve extracted data only after checking the PDF.</h2>
            {selectedPending.length === 0 ? (
              <div className="state-panel compact-state">No pending records for this company.</div>
            ) : (
              <div className="review-list">
                {selectedPending.map((item) => (
                  <article key={`${item.record_type}-${item.record_id}`}>
                    <span>{item.record_type.replace("_", " ")}</span>
                    <h3>{item.symbol}</h3>
                    <p>{item.summary}</p>
                    <small>{item.source_name || "No source name"}</small>
                    <button
                      className="button button-small"
                      disabled={Boolean(busyAction)}
                      onClick={() =>
                        runAction(`Approve ${item.record_type} #${item.record_id}`, () =>
                          approveReviewItem(item, "Reviewed from admin dashboard"),
                        )
                      }
                      type="button"
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not yet";
  }
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAutomationResult(result?: Record<string, number> | null) {
  if (!result) {
    return "No run completed yet";
  }
  return `${result.scored ?? 0} scored, ${result.imported ?? 0} imported, ${result.errors ?? 0} errors`;
}

function formatAutomationError(error: string) {
  return toUserMessage(
    error,
    "The last automation run did not finish. The technical details were logged on the server.",
  );
}

function formatAutomationStep(status?: AutomationStatus | null) {
  if (!status?.is_running) {
    return "Idle";
  }
  if (!status.current_step) {
    return "Running";
  }
  if (status.current_index && status.current_total) {
    return `${status.current_step} (${status.current_index}/${status.current_total})`;
  }
  return status.current_step;
}

export default AdminPage;
