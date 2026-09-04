"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  staff_profiles: { professional_name: string; crb: string }[];
};
type StaffCandidate = { user_id: string; email: string };
type Program = {
  id: string;
  name: string;
  level: string;
  service_level_business_days: number;
  repository_deposit_enabled: boolean;
  coordination_magic_link_enabled: boolean;
  coordination_contacts: { name: string; email: string; active: boolean }[];
};
type Announcement = {
  id: string;
  type: string;
  title: string;
  message: string;
  starts_at: string;
  ends_at: string | null;
  active: boolean;
  calendar_source?: "manual" | "federal_mgi";
  source_reference?: string | null;
};
type Template = {
  id: string;
  code: string;
  label: string;
  message: string;
  active: boolean;
  position: number;
};
type Faq = {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  position: number;
  featured_position: number | null;
};
type Relation<T> = T[] & Partial<T>;
type Log = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
  profiles: Relation<{ full_name: string }> | null;
};
type Purge = {
  id: string;
  request_id: string;
  object_path: string;
  purge_after: string;
  cataloging_requests: Relation<{ protocol: string }> | null;
};
type StatItem = { id?: string | null; label: string; count: number };
type Stats = {
  total: number;
  by_status: StatItem[];
  by_program: StatItem[];
  by_staff: StatItem[];
  records: Record<string, unknown>[];
};
const roleLabels: Record<string, string> = {
  student: "Estudante",
  cataloger: "Catalogador",
  administrator: "Administrador",
};
const statusLabels: Record<string, string> = {
  active: "Ativa",
  blocked: "Bloqueada",
  inactive: "Inativa",
};
const actionLabels: Record<string, string> = {
  account_administration_changed: "Conta alterada",
  program_operation_configuration_changed: "Programa configurado",
  library_announcement_saved: "Mural atualizado",
  issue_template_changed: "Template alterado",
  frequently_asked_question_saved: "Pergunta frequente alterada",
  nada_consta_purged: "Nada Consta expurgado",
};

export function AdminOperations(props: {
  area: "operacao" | "conteudo" | "controle";
  users: User[];
  staffCandidates: StaffCandidate[];
  programs: Program[];
  announcements: Announcement[];
  templates: Template[];
  logs: Log[];
  purgeDocuments: Purge[];
  faqs: Faq[];
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState(props.users);
  const [purge, setPurge] = useState(props.purgeDocuments);
  const [faqs, setFaqs] = useState(props.faqs);
  const [draggedFaqId, setDraggedFaqId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState(props.announcements);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [announcementType, setAnnouncementType] = useState("all");
  const [announcementActivity, setAnnouncementActivity] = useState("all");
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(props.area === "conteudo" ? "service" : props.area === "controle" ? "stats" : "users");
  const [userType, setUserType] = useState("all");
  const [userStatus, setUserStatus] = useState("all");
  const supabase = createClient();
  const runVerified = async (
    key: string,
    job: () => PromiseLike<{ error: unknown }>,
    verify: () => Promise<boolean>,
    ok: string,
  ) => {
    setBusy(key);
    setMessage("");
    const { error } = await job();
    const saved = !error && (await verify());
    setMessage(
      saved
        ? ok
        : "Não foi possível confirmar o salvamento. Confira os dados e tente novamente.",
    );
    setBusy("");
  };
  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);
  async function saveUser(user: User, form: FormData) {
    const role = String(form.get("role"));
    const status = String(form.get("status"));
    const professionalName = String(form.get("professional_name") ?? "");
    const crb = String(form.get("crb") ?? "");
    setBusy(`u-${user.id}`);
    setMessage("");
    const { error } = await supabase.rpc("admin_manage_account", {
      target_profile_id: user.id,
      target_role: role,
      target_status: status,
      professional_name: professionalName,
      professional_crb: crb,
    });
    const { data: saved, error: readError } = error
      ? { data: null, error: true }
      : await supabase
          .from("profiles")
          .select("role,status,staff_profiles(professional_name,crb)")
          .eq("id", user.id)
          .single();
    const staff = saved?.staff_profiles?.[0];
    const confirmed =
      !readError &&
      saved?.role === role &&
      saved.status === status &&
      (role === "student" ||
        Boolean(
          staff &&
          staff.professional_name === professionalName &&
          staff.crb === crb,
        ));
    if (confirmed) {
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                role,
                status,
                staff_profiles:
                  role === "student"
                    ? []
                    : [{ professional_name: professionalName, crb }],
              }
            : item,
        ),
      );
      setMessage("Alterações salvas e confirmadas no banco de dados.");
    } else
      setMessage(
        "Não foi possível confirmar o salvamento. Confira os dados e tente novamente.",
      );
    setBusy("");
  }
  async function provision(form: FormData) {
    const id = String(form.get("id"));
    const fullName = String(form.get("full_name"));
    const professionalName = String(form.get("professional_name"));
    const crb = String(form.get("crb"));
    const role = String(form.get("role"));
    await runVerified(
      "provision",
      () =>
        supabase.rpc("provision_staff_account", {
          target_user_id: id,
          staff_full_name: fullName,
          staff_professional_name: professionalName,
          staff_crb: crb,
          staff_role: role,
        }),
      async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name,role,status,staff_profiles(professional_name,crb)")
          .eq("id", id)
          .single();
        const staff = data?.staff_profiles?.[0];
        return (
          !error &&
          data?.full_name === fullName &&
          data.role === role &&
          data.status === "active" &&
          staff?.professional_name === professionalName &&
          staff.crb === crb
        );
      },
      "Conta provisionada e confirmada no banco de dados.",
    );
  }
  async function saveProgram(program: Program, form: FormData) {
    const sla = Number(form.get("sla"));
    const repository = form.get("repository") === "on";
    const coordination = form.get("coordination") === "on";
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    await runVerified(
      `p-${program.id}`,
      () =>
        supabase.rpc("admin_configure_program", {
          target_program_id: program.id,
          sla_business_days: sla,
          repository_enabled: repository,
          coordination_enabled: coordination,
          contact_name: name,
          contact_email: email,
        }),
      async () => {
        const { data, error } = await supabase
          .from("academic_programs")
          .select(
            "service_level_business_days,repository_deposit_enabled,coordination_magic_link_enabled,coordination_contacts(name,email,active)",
          )
          .eq("id", program.id)
          .single();
        const contact = data?.coordination_contacts?.find(
          (item) => item.active,
        );
        return (
          !error &&
          data?.service_level_business_days === sla &&
          data.repository_deposit_enabled === repository &&
          data.coordination_magic_link_enabled === coordination &&
          (!coordination ||
            Boolean(
              contact && contact.name === name && contact.email === email,
            ))
        );
      },
      "Alterações do programa salvas e confirmadas no banco de dados.",
    );
  }
  async function saveAnnouncement(form: FormData) {
    const type = String(form.get("type"));
    const title = String(form.get("title"));
    const messageText = String(form.get("message"));
    const startsAt = new Date(String(form.get("starts"))).toISOString();
    const endsAt = form.get("ends")
      ? new Date(String(form.get("ends"))).toISOString()
      : null;
    const active = form.get("active") === "on";
    setBusy("announcement");
    setMessage("");
    const { data: id, error } = await supabase.rpc("admin_save_announcement", {
      announcement_id: editingAnnouncement?.id || null,
      announcement_type: type,
      announcement_title: title,
      announcement_message: messageText,
      starts_at: startsAt,
      ends_at: endsAt,
      enabled: active,
    });
    const { data: saved, error: readError } =
      error || !id
        ? { data: null, error: true }
        : await supabase
            .from("library_announcements")
            .select("id,type,title,message,starts_at,ends_at,active")
            .eq("id", String(id))
            .single();
    if (!readError && saved) {
      setAnnouncements((current) =>
        editingAnnouncement?.id
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      setEditingAnnouncement(null);
      setMessage("Aviso salvo e confirmado no banco de dados.");
    } else
      setMessage(
        "Não foi possível confirmar o salvamento. Confira os dados e tente novamente.",
      );
    setBusy("");
  }
  async function deleteAnnouncement(announcement: Announcement) {
    if (!window.confirm(`Excluir “${announcement.title}”?`)) return;
    setBusy(`a-${announcement.id}`);
    const { error } = await supabase
      .from("library_announcements")
      .delete()
      .eq("id", announcement.id);
    if (!error) {
      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcement.id),
      );
      if (editingAnnouncement?.id === announcement.id)
        setEditingAnnouncement(null);
      setMessage("Aviso excluído.");
    } else setMessage("Não foi possível excluir o aviso.");
    setBusy("");
  }
  function saveAnnouncementAsNew() {
    if (!editingAnnouncement) return;
    setEditingAnnouncement({
      ...editingAnnouncement,
      id: undefined as unknown as string,
      title: `${editingAnnouncement.title} (cópia)`,
      active: false,
    });
  }
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const formatNumericDate = (value: string) => {
    const date = new Date(value);
    return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
  };
  const firstWeekday = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const eventsForDay = (day: number) => announcements.filter((item) => {
    const date = new Date(item.starts_at);
    return date.getUTCFullYear() === calendarYear && date.getUTCMonth() === calendarMonth && date.getUTCDate() === day;
  });
  function addClosure(day: number) {
    setSelectedCalendarDay(day);
    const existing = eventsForDay(day)[0];
    if (existing) { setEditingAnnouncement(existing); return; }
    const value = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T08:00`;
    setEditingAnnouncement({ id: "" as string, type: "other", title: "", message: "Biblioteca sem funcionamento.", starts_at: value, ends_at: null, active: true, calendar_source: "manual" });
  }
  async function saveTemplate(template: Template, form: FormData) {
    const label = String(form.get("label"));
    const messageText = String(form.get("message"));
    const active = form.get("active") === "on";
    const position = Number(form.get("position"));
    await runVerified(
      `t-${template.id}`,
      () =>
        supabase.rpc("admin_update_issue_template", {
          target_template_id: template.id,
          template_label: label,
          template_message: messageText,
          enabled: active,
          template_position: position,
        }),
      async () => {
        const { data, error } = await supabase
          .from("issue_templates")
          .select("label,message,active,position")
          .eq("id", template.id)
          .single();
        return (
          !error &&
          data?.label === label &&
          data.message === messageText &&
          data.active === active &&
          data.position === position
        );
      },
      "Template salvo e confirmado no banco de dados.",
    );
  }
  async function reorderFaqs(targetId: string) {
    if (!draggedFaqId || draggedFaqId === targetId) return;
    const source = faqs.findIndex((faq) => faq.id === draggedFaqId);
    const target = faqs.findIndex((faq) => faq.id === targetId);
    const next = [...faqs];
    const [moved] = next.splice(source, 1);
    next.splice(target, 0, moved);
    setFaqs(next.map((faq, index) => ({ ...faq, position: (index + 1) * 10 })));
    setDraggedFaqId(null);
    const { error } = await supabase.rpc("admin_reorder_frequently_asked_questions", { faq_ids: next.filter((faq) => faq.id).map((faq) => faq.id) });
    if (error) setMessage("Não foi possível salvar a nova ordem das perguntas.");
  }

  async function saveFaq(faq: Faq, form: FormData) {
    setBusy(`f-${faq.id || "new"}`);
    setMessage("");
    const payload = {
      faq_id: faq.id || null,
      faq_question: String(form.get("question")),
      faq_answer: String(form.get("answer")),
      faq_position: Number(form.get("position")),
      enabled: form.get("active") === "on",
      home_featured_position: form.get("featured_position") ? Number(form.get("featured_position")) : null,
    };
    const { data: id, error } = await supabase.rpc(
      "admin_save_frequently_asked_question",
      payload,
    );
    const { data: saved, error: readError } =
      error || !id
        ? { data: null, error: true }
        : await supabase
            .from("frequently_asked_questions")
            .select("question,answer,position,active,featured_position")
            .eq("id", String(id))
            .single();
    if (
      readError ||
      saved?.question !== payload.faq_question ||
      saved.answer !== payload.faq_answer ||
      saved.position !== payload.faq_position ||
      saved.active !== payload.enabled
      || saved.featured_position !== payload.home_featured_position
    )
      setMessage(
        "Não foi possível confirmar o salvamento. Confira os dados e tente novamente.",
      );
    else {
      setMessage("Pergunta frequente salva e confirmada no banco de dados.");
      setFaqs((current) =>
        current.map((item) =>
          item === faq
            ? {
                ...item,
                id: String(id),
                question: payload.faq_question,
                answer: payload.faq_answer,
                position: payload.faq_position,
                active: payload.enabled,
                featured_position: payload.home_featured_position,
              }
            : item,
        ),
      );
    }
    setBusy("");
  }
  async function loadStats(form: FormData) {
    setBusy("stats");
    const start = form.get("start")
      ? new Date(String(form.get("start"))).toISOString()
      : null;
    const end = form.get("end")
      ? new Date(`${String(form.get("end"))}T23:59:59`).toISOString()
      : null;
    const { data, error } = await supabase.rpc("admin_statistics", {
      period_start: start,
      period_end: end,
    });
    setStats(error ? null : (data as Stats));
    setMessage(
      error
        ? "Não foi possível calcular os indicadores."
        : "Indicadores atualizados.",
    );
    setBusy("");
  }
  function download(format: "json" | "csv") {
    if (!stats) return;
    let body: string, mime: string, name: string;
    if (format === "json") {
      body = JSON.stringify(stats.records, null, 2);
      mime = "application/json";
      name = "pronto-solicitacoes.json";
    } else {
      const keys = ["protocol", "status", "submitted_at", "program", "staff"];
      body = [
        keys.join(","),
        ...stats.records.map((r) =>
          keys
            .map((k) => `"${String(r[k] ?? "").replaceAll('"', '""')}"`)
            .join(","),
        ),
      ].join("\n");
      mime = "text/csv;charset=utf-8";
      name = "pronto-solicitacoes.csv";
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: mime }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function purgeFile(doc: Purge) {
    setBusy(`x-${doc.id}`);
    const removed = await supabase.storage
      .from("nada-consta")
      .remove([doc.object_path]);
    if (removed.error) {
      setMessage("O arquivo não pôde ser removido do Storage.");
      setBusy("");
      return;
    }
    const { error } = await supabase.rpc("admin_confirm_nada_consta_purge", {
      target_document_id: doc.id,
    });
    const { data: saved, error: readError } = error
      ? { data: null, error: true }
      : await supabase
          .from("nada_consta_documents")
          .select("object_path,status,purged_at")
          .eq("id", doc.id)
          .single();
    if (
      readError ||
      saved?.object_path !== null ||
      saved.status !== "purged" ||
      !saved.purged_at
    )
      setMessage(
        "Arquivo removido, mas o expurgo não foi confirmado no banco de dados.",
      );
    else {
      setPurge((v) => v.filter((x) => x.id !== doc.id));
      setMessage("Expurgo salvo e confirmado no banco de dados.");
    }
    setBusy("");
  }
  const filteredUsers = users.filter(
    (user) =>
      (userType === "all" ||
        (userType === "student"
          ? user.role === "student"
          : user.role !== "student")) &&
      (userStatus === "all" || user.status === userStatus),
  );
  const adminTabs: Record<typeof props.area, [string, string][]> = { operacao: [["users", "Equipe e acessos"], ["programs", "Programas e SLA"], ["library", "Calendário e mural"]], conteudo: [["service", "Pendências"], ["faq", "Ajuda e FAQ"]], controle: [["stats", "Indicadores"], ["retention", "Arquivos e retenção"], ["audit", "Auditoria"]] };
  useEffect(() => {
    setActiveTab(props.area === "conteudo" ? "service" : props.area === "controle" ? "stats" : "users");
  }, [props.area]);
  return (
    <div className="admin-operations" data-active-tab={activeTab}>
      {message && (
        <p className="auth-feedback admin-toast" role="status">
          {message}
        </p>
      )}
      <div className="admin-tabs" role="tablist" aria-label="Seções da área selecionada">
          {adminTabs[props.area].map(([id, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={activeTab === id ? "is-active" : ""}
            onClick={() => setActiveTab(id)}
            key={id}
          >
            {label}
          </button>
          ))}
      </div>
      <section className="panel admin-section">
        <p className="eyebrow">Usuários</p>
        <h2>Equipe e acessos</h2>
        <p>
          Bloqueio e inativação interrompem a autorização imediatamente. Para
          incluir alguém na equipe, crie e confirme primeiro a conta
          institucional no Supabase; ela aparecerá na seleção abaixo.
        </p>
        <form className="admin-grid admin-provision" action={provision}>
          <label>
            Conta institucional
            <select name="id" required defaultValue="">
              <option value="" disabled>
                {props.staffCandidates.length
                  ? "Selecione uma conta confirmada"
                  : "Nenhuma conta disponível"}
              </option>
              {props.staffCandidates.map((candidate) => (
                <option key={candidate.user_id} value={candidate.user_id}>
                  {candidate.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nome completo
            <input name="full_name" required />
          </label>
          <label>
            Nome profissional
            <input name="professional_name" required />
          </label>
          <label>
            CRB
            <input name="crb" required />
          </label>
          <label>
            Perfil
            <select name="role">
              <option value="cataloger">Catalogador</option>
              <option value="administrator">Administrador</option>
            </select>
          </label>
          <button
            className="button button--primary button--small"
            disabled={
              busy === "provision" || props.staffCandidates.length === 0
            }
          >
            Provisionar equipe
          </button>
        </form>
        <div className="admin-user-filters">
          <label>
            Tipo de conta
            <select
              value={userType}
              onChange={(event) => setUserType(event.target.value)}
            >
              <option value="all">Todos</option>
              <option value="student">Estudantes</option>
              <option value="staff">Bibliotecários</option>
            </select>
          </label>
          <label>
            Situação
            <select
              value={userStatus}
              onChange={(event) => setUserStatus(event.target.value)}
            >
              <option value="all">Todas</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <span>
            {filteredUsers.length} conta{filteredUsers.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="admin-list">
          {filteredUsers.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              busy={busy === `u-${user.id}`}
              onSave={saveUser}
            />
          ))}
        </div>
      </section>
      <section className="panel admin-section">
        <p className="eyebrow">Programas</p>
        <h2>Programas, coordenações e SLA</h2>
        <div className="admin-list">
          {props.programs.map((p) => {
            const c = p.coordination_contacts.find((x) => x.active);
            return (
              <form
                className="admin-row admin-row--program"
                action={(f) => saveProgram(p, f)}
                key={p.id}
              >
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.level}</small>
                </div>
                <label>
                  SLA (dias úteis)
                  <input
                    name="sla"
                    type="number"
                    min="1"
                    max="30"
                    defaultValue={p.service_level_business_days}
                  />
                </label>
                <label>
                  <input
                    name="repository"
                    type="checkbox"
                    defaultChecked={p.repository_deposit_enabled}
                  />{" "}
                  Guia RI ativo
                </label>
                <label>
                  <input
                    name="coordination"
                    type="checkbox"
                    defaultChecked={p.coordination_magic_link_enabled}
                  />{" "}
                  Magic Link ativo
                </label>
                <label>
                  Contato
                  <input name="name" defaultValue={c?.name ?? ""} />
                </label>
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    defaultValue={c?.email ?? ""}
                  />
                </label>
                <button
                  className="button button--secondary button--small"
                  disabled={busy === `p-${p.id}`}
                >
                  Salvar
                </button>
              </form>
            );
          })}
        </div>
      </section>
      <section className="panel admin-section">
        <p className="eyebrow">Biblioteca</p>
        <h2>Calendário e comunicados da biblioteca</h2>
        <p>
          Feriados e pontos facultativos federais entram no cálculo de dias úteis. Clique em uma data para registrar manualmente um dia sem funcionamento da biblioteca.
        </p>
        <div className="operational-calendar" aria-label="Calendário operacional">
          <div className="operational-calendar__header">
            <button type="button" onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))}>Mês anterior</button>
            <strong>{monthNames[calendarMonth]} {calendarYear}</strong>
            <button type="button" onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))}>Próximo mês</button>
          </div>
          <div className="operational-calendar__legend" aria-label="Legenda do calendário">
            <span><i className="is-holiday" />Feriado federal</span>
            <span><i className="is-optional" />Ponto facultativo federal</span>
            <span><i className="is-manual" />Ocorrência da biblioteca</span>
            <span><i className="is-weekend" />Fim de semana</span>
          </div>
          <div className="operational-calendar__week">{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="operational-calendar__days">
            {Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const events = eventsForDay(day);
              const weekend = [0, 6].includes(new Date(calendarYear, calendarMonth, day).getDay());
              const source = events[0]?.calendar_source === "federal_mgi" ? "federal" : "manual";
              const type = events[0]?.type === "holiday" ? "Feriado" : events[0]?.type === "optional_day" ? "Ponto facultativo" : "Biblioteca";
              return <button type="button" key={day} aria-pressed={selectedCalendarDay === day} className={`${weekend ? "is-weekend " : ""}${events.length ? `has-event is-${source}` : ""}${selectedCalendarDay === day ? " is-selected" : ""}`} onClick={() => addClosure(day)}><b>{day}</b>{events.slice(0, 1).map((event) => <span className="calendar-event" key={event.id}><em>{type}</em><small>{event.title}</small></span>)}</button>;
            })}
            {Array.from({ length: (7 - ((firstWeekday + daysInMonth) % 7)) % 7 }, (_, index) => <span key={`after-${index}`} />)}
          </div>
        </div>
        <form
          className="admin-grid"
          key={editingAnnouncement?.id ?? "new"}
          action={saveAnnouncement}
        >
          <label>
            Tipo
            <select
              name="type"
              defaultValue={editingAnnouncement?.type ?? "normal"}
            >
              <option value="normal">Normal</option>
              <option value="recess">Recesso</option>
              <option value="strike">Paralisação/greve</option>
              <option value="holiday">Feriado</option>
              <option value="optional_day">Ponto facultativo</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Título
            <input
              name="title"
              required
              defaultValue={editingAnnouncement?.title ?? ""}
            />
          </label>
          <label className="admin-wide">
            Mensagem
            <textarea
              name="message"
              rows={3}
              required
              defaultValue={editingAnnouncement?.message ?? ""}
            />
          </label>
          <label>
            Início
            <input
              name="starts"
              type="datetime-local"
              required
              defaultValue={editingAnnouncement?.starts_at.slice(0, 16) ?? ""}
            />
          </label>
          <label>
            Fim opcional
            <input
              name="ends"
              type="datetime-local"
              defaultValue={editingAnnouncement?.ends_at?.slice(0, 16) ?? ""}
            />
          </label>
          <label>
            <input
              name="active"
              type="checkbox"
              defaultChecked={editingAnnouncement?.active ?? true}
            />{" "}
            Ativo
          </label>
          <button
            className="button button--primary button--small"
            disabled={busy === "announcement"}
          >
            {editingAnnouncement ? "Salvar alteração" : "Publicar aviso"}
          </button>
          {editingAnnouncement && (
            <>
              <button
                type="button"
                className="button button--secondary button--small"
                onClick={saveAnnouncementAsNew}
              >
                Salvar como novo
              </button>
              <button
                type="button"
                className="button button--secondary button--small"
                onClick={() => setEditingAnnouncement(null)}
              >
                Cancelar
              </button>
            </>
          )}
        </form>
        <div className="admin-user-filters">
          <label>
            Buscar
            <input
              value={announcementSearch}
              onChange={(event) => setAnnouncementSearch(event.target.value)}
              placeholder="Título ou mensagem"
            />
          </label>
          <label>
            Tipo
            <select
              value={announcementType}
              onChange={(event) => setAnnouncementType(event.target.value)}
            >
              <option value="all">Todos</option>
              <option value="normal">Normal</option>
              <option value="recess">Recesso</option>
              <option value="strike">Paralisação</option>
              <option value="holiday">Feriado</option>
              <option value="optional_day">Ponto facultativo</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Situação
            <select
              value={announcementActivity}
              onChange={(event) => setAnnouncementActivity(event.target.value)}
            >
              <option value="all">Todas</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </label>
        </div>
        <div className="calendar-records" aria-label="Ocorrências cadastradas">
          <div className="calendar-records__header" aria-hidden="true"><span>Data</span><span>Ocorrência</span><span>Tipo e origem</span><span>Situação</span><span>Ações</span></div>
        {announcements
          .filter(
            (a) =>
              (announcementType === "all" || a.type === announcementType) &&
              (announcementActivity === "all" ||
                (announcementActivity === "active") === a.active) &&
              `${a.title} ${a.message}`
                .toLowerCase()
                .includes(announcementSearch.toLowerCase()),
          )
          .map((a) => {
            const typeLabel = a.type === "holiday" ? "Feriado" : a.type === "optional_day" ? "Ponto facultativo" : a.type === "recess" ? "Recesso" : a.type === "strike" ? "Paralisação/greve" : a.type === "normal" ? "Aviso normal" : "Ocorrência local";
            const sourceLabel = a.calendar_source === "federal_mgi" ? "Calendário federal (MGI)" : "Cadastro manual da biblioteca";
            return <article className="calendar-record" key={a.id}>
              <time dateTime={a.starts_at}>{formatNumericDate(a.starts_at)}</time>
              <div><strong>{a.title}</strong><p>{a.message}</p></div>
              <div><span className={`calendar-badge is-${a.type}`}>{typeLabel}</span><small>{sourceLabel}</small></div>
              <span className={`calendar-status ${a.active ? "is-active" : ""}`}>{a.active ? "Ativo" : "Inativo"}</span>
              <div className="actions">
                <button
                  type="button"
                  className="button button--secondary button--small"
                  onClick={() => setEditingAnnouncement(a)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="button button--secondary button--small"
                  disabled={busy === `a-${a.id}`}
                  onClick={() => deleteAnnouncement(a)}
                >
                  Excluir
                </button>
              </div>
            </article>;
          })}
          {!announcements.some((a) => (announcementType === "all" || a.type === announcementType) && (announcementActivity === "all" || (announcementActivity === "active") === a.active) && `${a.title} ${a.message}`.toLowerCase().includes(announcementSearch.toLowerCase())) && <p className="calendar-records__empty">Nenhuma ocorrência corresponde aos filtros.</p>}
        </div>
      </section>
      <section className="panel admin-section">
        <p className="eyebrow">Atendimento</p>
        <h2>Pendências e respostas padrão</h2>
        {props.templates.map((t) => (
          <form
            className="admin-row admin-row--template"
            action={(f) => saveTemplate(t, f)}
            key={t.id}
          >
            <code>{t.code}</code>
            <label>
              Rótulo
              <input name="label" defaultValue={t.label} />
            </label>
            <label className="admin-wide">
              Texto
              <textarea name="message" defaultValue={t.message} />
            </label>
            <label>
              Ordem
              <input name="position" type="number" defaultValue={t.position} />
            </label>
            <label>
              <input name="active" type="checkbox" defaultChecked={t.active} />{" "}
              Ativo
            </label>
            <button className="button button--secondary button--small">
              Salvar
            </button>
          </form>
        ))}
      </section>
      <section className="panel admin-section">
        <p className="eyebrow">Indicadores</p>
        <h2>Indicadores e exportação</h2>
        <form className="admin-grid" action={loadStats}>
          <label>
            De
            <input name="start" type="date" />
          </label>
          <label>
            Até
            <input name="end" type="date" />
          </label>
          <button
            className="button button--primary button--small"
            disabled={busy === "stats"}
          >
            Calcular
          </button>
        </form>
        {stats && (
          <>
            <div className="stat-grid">
              <article>
                <strong>{stats.total}</strong>
                <span>solicitações</span>
              </article>
              {stats.by_status.map((x) => (
                <article key={x.label}>
                  <strong>{x.count}</strong>
                  <span>{x.label}</span>
                </article>
              ))}
            </div>
            <div className="admin-columns">
              <Metric title="Por curso/programa" items={stats.by_program} />
              <Metric title="Por bibliotecário" items={stats.by_staff} />
            </div>
            <div className="button-row">
              <button
                className="button button--secondary button--small"
                onClick={() => download("csv")}
              >
                Exportar CSV
              </button>
              <button
                className="button button--secondary button--small"
                onClick={() => download("json")}
              >
                Exportar JSON
              </button>
            </div>
          </>
        )}
      </section>
      <section className="panel admin-section">
        <p className="eyebrow">Retenção</p>
        <h2>Arquivos e retenção</h2>
        <p>
          Somente documentos cujo prazo de 60 dias venceu aparecem aqui. A
          remoção apaga o arquivo e preserva o registro textual da validação.
        </p>
        {purge.length === 0 ? (
          <p>Nenhum documento aguardando expurgo.</p>
        ) : (
          purge.map((d) => (
            <div className="admin-summary" key={d.id}>
              <strong>{d.cataloging_requests?.protocol ?? d.request_id}</strong>
              <span>
                Prazo: {new Date(d.purge_after).toLocaleString("pt-BR")}
              </span>
              <button
                className="button button--danger button--small"
                disabled={busy === `x-${d.id}`}
                onClick={() => purgeFile(d)}
              >
                Expurgar arquivo
              </button>
            </div>
          ))
        )}
      </section>
      <section className="panel admin-section">
        <p className="eyebrow">Auditoria</p>
        <h2>Auditoria operacional</h2>
        <div className="audit-table">
          {props.logs.map((l) => (
            <article key={l.id}>
              <time>{new Date(l.occurred_at).toLocaleString("pt-BR")}</time>
              <strong>{actionLabels[l.action] ?? l.action}</strong>
              <span>
                {l.profiles?.full_name ?? "Sistema"} · {l.entity_type}
                {l.entity_id ? ` · ${l.entity_id}` : ""}
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="panel admin-section">
        <p className="eyebrow">Conteúdo público</p>
        <h2>Ajuda e perguntas frequentes</h2>
        <p>
          Edite as respostas públicas, desative itens temporariamente ou
          acrescente novas perguntas.
        </p>
        <div className="admin-list">
          {faqs.map((faq) => (
            <form
              className="admin-row admin-row--faq"
              action={(form) => saveFaq(faq, form)}
              key={`${faq.id || "new"}-${faq.featured_position ?? "none"}`}
              draggable={Boolean(faq.id)}
              onDragStart={() => setDraggedFaqId(faq.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => reorderFaqs(faq.id)}
            >
              <label className="admin-row--faq-question">
                Pergunta
                <input
                  name="question"
                  required
                  minLength={5}
                  maxLength={300}
                  defaultValue={faq.question}
                />
              </label>
              <label className="admin-row--faq-answer">
                Resposta
                <textarea
                  name="answer"
                  required
                  minLength={5}
                  maxLength={4000}
                  rows={3}
                  defaultValue={faq.answer}
                />
              </label>
              <label>
                Ordem
                <input
                  name="position"
                  type="number"
                  min="0"
                  max="9999"
                  defaultValue={faq.position}
                />
              </label>
              <label className="compact-check">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={faq.active}
                />{" "}
                Publicada
              </label>
              <label>
                Página inicial
                <select name="featured_position" defaultValue={faq.featured_position ?? ""}>
                  <option value="">Não exibir</option>
                  <option value="1">Posição 1</option>
                  <option value="2">Posição 2</option>
                  <option value="3">Posição 3</option>
                </select>
              </label>
              <button
                className="button button--secondary button--small"
                disabled={busy === `f-${faq.id || "new"}`}
              >
                Salvar
              </button>
            </form>
          ))}
        </div>
        <div className="faq-add-action">
        <button
          className="button button--primary button--small"
          type="button"
          onClick={() =>
            setFaqs((current) => [
              ...current,
              {
                id: "",
                question: "",
                answer: "",
                position:
                  Math.max(0, ...current.map((item) => item.position)) + 10,
                active: true,
                featured_position: null,
              },
            ])
          }
        >
          Adicionar pergunta
        </button>
        </div>
      </section>
    </div>
  );
}
function Metric({ title, items }: { title: string; items: StatItem[] }) {
  return (
    <div>
      <h3>{title}</h3>
      {items.map((x) => (
        <div className="metric-row" key={`${x.id}-${x.label}`}>
          <span>{x.label}</span>
          <strong>{x.count}</strong>
        </div>
      ))}
    </div>
  );
}
function UserRow({
  user,
  busy,
  onSave,
}: {
  user: User;
  busy: boolean;
  onSave: (user: User, form: FormData) => Promise<void>;
}) {
  const [role, setRole] = useState(user.role);
  const staff = role !== "student";
  const details = user.staff_profiles?.[0];
  return (
    <form
      className={`admin-row ${staff ? "admin-row--staff" : "admin-row--student"}`}
      action={(form) => onSave(user, form)}
    >
      <div>
        <strong>{user.full_name}</strong>
        <small>{user.email}</small>
      </div>
      <label>
        Perfil
        <select
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          {Object.entries(roleLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Situação
        <select name="status" defaultValue={user.status}>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {staff && (
        <>
          <label>
            Nome profissional
            <input
              name="professional_name"
              required
              defaultValue={details?.professional_name ?? ""}
            />
          </label>
          <label>
            CRB
            <input name="crb" required defaultValue={details?.crb ?? ""} />
          </label>
        </>
      )}
      <button
        className="button button--secondary button--small"
        disabled={busy}
      >
        Salvar
      </button>
    </form>
  );
}
