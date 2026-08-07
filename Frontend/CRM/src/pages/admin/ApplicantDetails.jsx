import { useEffect, useState } from "react";
import { getApplicantById } from "../../api/recruitmentApi";

const STATUS_STYLES = {
    hired: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
    approved: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
    rejected: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", dot: "bg-rose-500" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500" },
    review: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500" },
    default: { bg: "bg-slate-100", text: "text-slate-600", ring: "ring-slate-200", dot: "bg-slate-400" },
};

function getStatusStyle(status) {
    if (!status) return STATUS_STYLES.default;
    const key = status.toLowerCase();
    return STATUS_STYLES[key] || STATUS_STYLES.default;
}

function getScoreColor(score) {
    const n = Number(score);
    if (Number.isNaN(n)) return "text-slate-700";
    if (n >= 80) return "text-emerald-600";
    if (n >= 50) return "text-amber-600";
    return "text-rose-600";
}

function InfoField({ label, value, icon }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {label}
                </p>
                <p className="truncate text-sm font-medium text-slate-800">
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

const ICONS = {
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
    ),
    phone: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.76l1.1 4.4a1 1 0 01-.5 1.14l-1.7.85a11.05 11.05 0 005.5 5.5l.85-1.7a1 1 0 011.14-.5l4.4 1.1a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C9.16 21 3 14.84 3 7V5z" />
        </svg>
    ),
    flag: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18M5 4h11l-2 4 2 4H5" />
        </svg>
    ),
};

export default function ApplicantDetails({ applicantId }) {

    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApplicant = () => {
        if (!applicantId) return;

        setLoading(true);
        setError(null);

        getApplicantById(applicantId)
            .then((res) => {
                setApplicant(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load applicant.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchApplicant();
    }, [applicantId]);

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
                <p className="text-sm text-slate-500">Loading applicant…</p>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-5 text-red-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 004 21h16a2 2 0 001.89-2.96L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <div>
                    <p className="text-sm font-semibold">Couldn't load applicant</p>
                    <button
                        onClick={fetchApplicant}
                        className="mt-1 text-sm font-medium underline underline-offset-2 hover:text-red-700"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );

    if (!applicant) return null;

    const statusStyle = getStatusStyle(applicant.status);
    const scoreColor = getScoreColor(applicant.score);

    const questions = [
        "How would you convince a customer to buy a product they are unsure about?",
        "How would you handle a customer who is unhappy with your product or service?",
        "What approach would you take to build a long-term relationship with a customer?",
        "How would you respond if a potential customer says your product is too expensive?",
    ];
    const answers = [applicant.answer1, applicant.answer2, applicant.answer3, applicant.answer4];

    return (
        <div className="max-h-[80vh] space-y-5 overflow-y-auto pr-1">

            {/* Basic Information */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">

                <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            {ICONS.user}
                        </div>
                        Applicant information
                    </h3>

                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                        {applicant.status || "Unknown"}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoField label="Name" value={applicant.name} icon={ICONS.user} />
                    <InfoField label="Email" value={applicant.email} icon={ICONS.mail} />
                    <InfoField label="Phone" value={applicant.phone} icon={ICONS.phone} />
                    <InfoField label="Status" value={applicant.status} icon={ICONS.flag} />
                </div>

            </div>

            {/* AI Evaluation */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">

                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-indigo-900">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                        </svg>
                    </div>
                    AI evaluation
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">

                    <div className="flex gap-6 sm:flex-col sm:gap-4">
                        <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-indigo-100">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Score
                            </p>
                            <p className={`text-2xl font-bold tabular-nums ${scoreColor}`}>
                                {applicant.score ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-indigo-100">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Recommendation
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                                {applicant.recommendation || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white/80 p-4 ring-1 ring-indigo-100">
                        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Analysis
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                            {applicant.analysis || "No analysis available."}
                        </p>
                    </div>

                </div>

            </div>

            {/* Answers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12a9 9 0 11-9-9 9 9 0 019 9z" />
                        </svg>
                    </div>
                    Candidate responses
                </h3>

                <div className="space-y-4">
                    {questions.map((q, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50"
                        >
                            <p className="flex gap-2 text-sm font-semibold text-slate-800">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-600">
                                    {i + 1}
                                </span>
                                {q}
                            </p>
                            <p className="mt-2 pl-7 text-sm leading-relaxed text-slate-600">
                                {answers[i] || "No response provided."}
                            </p>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}