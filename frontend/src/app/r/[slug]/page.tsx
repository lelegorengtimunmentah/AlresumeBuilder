import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type {
	Resume,
	Education,
	Experience,
	Skill,
	Project,
	Certificate,
} from '@/types/resume';

// --- Types

type PublicResume = Resume & {
	education: Education[];
	experience: Experience[];
	skills: Skill[];
	projects: Project[];
	certificates: Certificate[];
};

interface PublicResumeResponse {
	data: PublicResume;
}

// --- Data fetching

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function fetchPublicResume(slug: string): Promise<PublicResume | null> {
	try {
		const res = await fetch(`${API_URL}/api/r/${encodeURIComponent(slug)}`, {
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = (await res.json()) as PublicResumeResponse;
		return json.data;
	} catch {
		return null;
	}
}

function resolveAssetUrl(url: string | null | undefined): string | null {
	if (!url) return null;
	if (
		url.startsWith('http://') ||
		url.startsWith('https://') ||
		url.startsWith('data:')
	) {
		return url;
	}
	return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

// --- Metadata

export async function generateMetadata(props: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await props.params;
	const resume = await fetchPublicResume(slug);
	if (!resume) return { title: 'Resume Tidak Ditemukan' };
	return {
		title: resume.full_name ? `${resume.full_name} -- Resume` : resume.title,
	};
}

// --- Helpers

function formatDateRange(
	startDate: string,
	endDate: string | null,
	isCurrent?: boolean,
): string {
	const fmt = (d: string) =>
		new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
	const start = fmt(startDate);
	const end = isCurrent ? 'Sekarang' : endDate ? fmt(endDate) : 'Sekarang';
	return `${start} - ${end}`;
}

const SKILL_LEVEL_LABEL: Record<string, string> = {
	beginner: 'Pemula',
	intermediate: 'Menengah',
	advanced: 'Mahir',
};

// --- Section wrapper (print-ready resume section)

function Section({
	id,
	title,
	children,
}: {
	id?: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section aria-labelledby={id} className="mt-8 break-inside-avoid">
			<h2
				id={id}
				className="mb-3 border-b-2 border-slate-300 pb-1 text-[13px] font-bold uppercase tracking-[0.18em] text-slate-900"
			>
				{title}
			</h2>
			{children}
		</section>
	);
}

// --- Page

export default async function PublicResumePage(props: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await props.params;
	const resume = await fetchPublicResume(slug);

	if (!resume) {
		return (
			<main className=" min-h-screen flex items-center justify-center p-8">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-semibold text-foreground">
						Resume tidak ditemukan
					</h1>
					<p className="text-sm text-muted-foreground">
						Resume ini mungkin sudah tidak tersedia atau URL tidak valid.
					</p>
				</div>
			</main>
		);
	}

	const hasEducation = resume.education && resume.education.length > 0;
	const hasExperience = resume.experience && resume.experience.length > 0;
	const hasSkills = resume.skills && resume.skills.length > 0;
	const hasProjects = resume.projects && resume.projects.length > 0;
	const hasCertificates =
		resume.certificates && resume.certificates.length > 0;

	return (
		<main className="min-h-screen bg-muted/50 px-4 py-8 print:bg-white print:py-0">
			<div className="mx-auto w-full max-w-[210mm] rounded-md bg-white px-8 py-10 text-slate-900 shadow-xl shadow-black/5 print:rounded-none print:p-0 print:shadow-none sm:px-12 sm:py-14">
				{/* ── Header ── */}
				<header className="flex justify-between gap-6">
					<div className="flex-1">
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
							{resume.full_name ?? resume.title}
						</h1>
						{(resume.phone || resume.address) && (
							<p className="mt-2 text-sm text-slate-600">
								{[resume.phone, resume.address]
									.filter(Boolean)
									.join(' - ')}
							</p>
						)}
					</div>
					{resume.photo_url && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={resolveAssetUrl(resume.photo_url) ?? undefined}
							alt="Foto profil"
							className="h-28 w-24 shrink-0 rounded-sm border border-slate-300 object-cover"
						/>
					)}
				</header>

				{resume.summary && (
					<Section id="summary-heading" title="Ringkasan">
						<p className="text-sm leading-relaxed text-slate-700">
							{resume.summary}
						</p>
					</Section>
				)}

				{hasEducation && (
					<Section id="education-heading" title="Pendidikan">
						<ul className="space-y-3">
							{resume.education.map((edu: Education) => (
								<li
									key={edu.id}
									className="flex justify-between gap-4 print:break-inside-avoid"
								>
									<div>
										<p className="text-sm font-semibold text-slate-900">
											{edu.degree}
											{edu.field_of_study
												? ` - ${edu.field_of_study}`
												: ''}
										</p>
										<p className="text-sm text-slate-600">
											{edu.institution}
										</p>
										{edu.gpa && (
											<p className="mt-0.5 text-xs text-slate-500">
												IPK: {edu.gpa}
											</p>
										)}
									</div>
									<p className="whitespace-nowrap text-xs text-slate-500">
										{formatDateRange(edu.start_date, edu.end_date)}
									</p>
								</li>
							))}
						</ul>
					</Section>
				)}

				{hasExperience && (
					<Section id="experience-heading" title="Pengalaman">
						<ul className="space-y-4">
							{resume.experience.map((exp: Experience) => (
								<li key={exp.id} className="print:break-inside-avoid">
									<div className="flex justify-between gap-4">
										<div>
											<p className="text-sm font-semibold text-slate-900">
												{exp.position}
											</p>
											<p className="text-sm text-slate-600">
												{exp.company}
											</p>
										</div>
										<p className="whitespace-nowrap text-xs text-slate-500">
											{formatDateRange(
												exp.start_date,
												exp.end_date,
												exp.is_current,
											)}
										</p>
									</div>
									{exp.description && (
										<p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
											{exp.description}
										</p>
									)}
								</li>
							))}
						</ul>
					</Section>
				)}

				{hasSkills && (
					<Section id="skills-heading" title="Skill">
						<p className="text-sm text-slate-700">
							{resume.skills.map((skill: Skill, i: number) => (
								<span key={skill.id}>
									{i > 0 && (
										<span className="text-slate-400"> &middot; </span>
									)}
									<span className="font-medium text-slate-900">
										{skill.name}
									</span>
									{skill.level && (
										<span className="text-slate-500">
											{' '}(
											{SKILL_LEVEL_LABEL[skill.level] ?? skill.level})
										</span>
									)}
								</span>
							))}
						</p>
					</Section>
				)}

				{hasProjects && (
					<Section id="projects-heading" title="Proyek">
						<ul className="space-y-3">
							{resume.projects.map((project: Project) => (
								<li
									key={project.id}
									className="print:break-inside-avoid"
								>
									<div className="flex justify-between gap-4">
										<p className="text-sm font-semibold text-slate-900">
											{project.url ? (
												<a
													href={project.url}
													target="_blank"
													rel="noopener noreferrer"
													className="underline underline-offset-2 transition-colors hover:text-slate-600"
												>
													{project.name}
												</a>
											) : (
												project.name
											)}
										</p>
										{project.tech_stack && (
											<p className="whitespace-nowrap text-xs text-slate-500">
												{project.tech_stack}
											</p>
										)}
									</div>
									{project.description && (
										<p className="mt-1 text-sm leading-relaxed text-slate-700">
											{project.description}
										</p>
									)}
								</li>
							))}
						</ul>
					</Section>
				)}

				{hasCertificates && (
					<Section id="certificates-heading" title="Sertifikat">
						<ul className="space-y-2.5">
							{resume.certificates.map((cert: Certificate) => (
								<li
									key={cert.id}
									className="flex justify-between gap-4 print:break-inside-avoid"
								>
									<div>
										<p className="text-sm font-semibold text-slate-900">
											{cert.credential_url ? (
												<a
													href={cert.credential_url}
													target="_blank"
													rel="noopener noreferrer"
													className="underline underline-offset-2 transition-colors hover:text-slate-600"
												>
													{cert.name}
												</a>
											) : (
												cert.name
											)}
										</p>
										<p className="text-xs text-slate-600">
											{cert.issuer}
										</p>
									</div>
									<p className="whitespace-nowrap text-xs text-slate-500">
										{new Date(cert.issue_date).toLocaleDateString(
											'id-ID',
											{ year: 'numeric', month: 'short' },
										)}
									</p>
								</li>
							))}
						</ul>
					</Section>
				)}
			</div>
		</main>
	);
}