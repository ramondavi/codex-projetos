import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CatalogingCardReview } from "@/components/cataloging-card-review";
import type { CatalogingCardSnapshot } from "@/domain/cataloging-card/types";
import { createClient } from "@/lib/supabase/server";

type RequestRow = {
  id: string; protocol: string; status: string; assigned_to: string | null; title: string; subtitle: string | null;
  equivalent_title: string | null; other_titles: string[]; volume_information: string | null; special_cases: string[];
  enrollment: { program: { name: string; level: string } | { name: string; level: string }[] | null } | { program: { name: string; level: string } | { name: string; level: string }[] | null }[] | null;
};
const first = <T,>(value: T | T[] | null | undefined): T | null => Array.isArray(value) ? value[0] ?? null : value ?? null;

export default async function CatalogingCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (!user || !profile || !["cataloger", "administrator"].includes(profile.role)) redirect("/painel");
  const [{ data }, { data: people }, { data: subjects }, { data: metadata }, { data: staff }, { data: homologation }] = await Promise.all([
    supabase.from("cataloging_requests").select(`id, protocol, status, assigned_to, title, subtitle, equivalent_title, other_titles, volume_information, special_cases, enrollment:academic_enrollments!cataloging_requests_academic_enrollment_id_fkey(program:academic_programs!academic_enrollments_academic_program_id_fkey(name, level))`).eq("id", id).maybeSingle(),
    supabase.from("request_cataloging_people").select("role, transcribed_name, authorized_name_snapshot, position").eq("request_id", id).order("position"),
    supabase.from("request_controlled_terms").select("label_pt_snapshot, label_en_snapshot, is_primary, position").eq("request_id", id).order("position"),
    supabase.from("request_cataloging_metadata").select("cdu_code, cutter_code").eq("request_id", id).maybeSingle(),
    supabase.from("staff_profiles").select("professional_name, crb").eq("profile_id", user.id).maybeSingle(),
    supabase.from("cataloging_card_homologations").select("snapshot, homologated_at").eq("request_id", id).maybeSingle(),
  ]);
  if (!data) notFound();
  const request = data as unknown as RequestRow;
  const program = first(first(request.enrollment)?.program);
  const draft: CatalogingCardSnapshot = {
    institution: { university: "Universidade Federal da Bahia — UFBA", librarySystem: "Sistema Universitário de Bibliotecas — SIBI", library: "Biblioteca da Faculdade de Arquitetura — BIB/FA" },
    request: { protocol: request.protocol, title: request.title, subtitle: request.subtitle, equivalentTitle: request.equivalent_title, otherTitles: request.other_titles, volumeInformation: request.volume_information, specialCases: request.special_cases, programName: program?.name ?? "", academicLevel: program?.level ?? "" },
    people: (people ?? []).map((person) => ({ role: person.role, transcribedName: person.transcribed_name, authorizedName: person.authorized_name_snapshot, position: person.position })),
    subjects: (subjects ?? []).map((subject) => ({ labelPt: subject.label_pt_snapshot, labelEn: subject.label_en_snapshot, isPrimary: subject.is_primary, position: subject.position })),
    classification: { cdu: metadata?.cdu_code ?? "", cutter: metadata?.cutter_code ?? "" },
    technicalResponsibility: { name: staff?.professional_name ?? "", crb: staff?.crb ?? "" },
    catalogingConventions: { electronicResourceLabel: "[recurso eletrônico]", physicalDescriptionAbbreviation: "p.", tracingsLabel: "Traçados" },
    layoutStatus: "provisional_pending_institutional_examples",
  };
  const snapshot = homologation?.snapshot ? homologation.snapshot as unknown as CatalogingCardSnapshot : draft;
  const ready = Boolean(metadata?.cdu_code && metadata?.cutter_code && staff?.professional_name && staff?.crb && people?.some((person) => person.role === "author") && people?.some((person) => person.role === "advisor") && subjects?.some((subject) => subject.is_primary));
  return <main className="dashboard-main dashboard-main--card"><Link className="back-link" href={`/painel/atendimento/${id}`}>← Voltar para a análise</Link>{!ready && !homologation && <div className="notice notice--error">Complete autor, orientador, termo principal, CDU e Cutter antes da homologação.</div>}<CatalogingCardReview requestId={id} snapshot={snapshot} homologatedAt={homologation?.homologated_at ?? null} canHomologate={ready && request.assigned_to === user.id && request.status === "in_review"} /></main>;
}
