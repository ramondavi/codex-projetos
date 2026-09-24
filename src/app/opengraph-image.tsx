import { ImageResponse } from "next/og";
import { getInterfaceLanguage } from "@/lib/server-language";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pronto! — Assistente de Fichas Catalográficas e Autodepósito";

const copy = {
  pt: ["Assistente de Fichas Catalográficas e Autodepósito", "Biblioteca da Faculdade de Arquitetura"],
  en: ["Catalog Record and Self-deposit Assistant", "Faculty of Architecture Library"],
  es: ["Asistente de fichas catalográficas y autodepósito", "Biblioteca de la Facultad de Arquitectura"],
  de: ["Assistent für Katalogeinträge und Selbsteinreichung", "Bibliothek der Fakultät für Architektur"],
  fr: ["Assistant de catalogage et d’auto-dépôt", "Bibliothèque de la faculté d’architecture"],
  it: ["Assistente per schede catalografiche e autodeposito", "Biblioteca della Facoltà di Architettura"],
};

export default async function OpenGraphImage() {
  const [tagline, library] = copy[await getInterfaceLanguage()];
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "#f4f6f9", color: "#172033", padding: "74px" }}><div style={{ position: "absolute", width: "620px", height: "620px", right: "-170px", top: "-190px", border: "34px solid #1a3b70", transform: "rotate(26deg)", opacity: .92 }} /><div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}><div style={{ display: "flex", alignItems: "center", gap: "18px", color: "#1a3b70", fontSize: 27, fontWeight: 700, letterSpacing: 2 }}><span style={{ display: "flex", width: "38px", height: "38px", border: "3px solid #1a3b70", alignItems: "center", justifyContent: "center", fontSize: 26 }}>P</span> BIB/FA · UFBA</div><div style={{ display: "flex", flexDirection: "column", maxWidth: "790px" }}><span style={{ fontSize: 74, lineHeight: 1, fontWeight: 800, letterSpacing: -3 }}>Pronto!</span><span style={{ marginTop: "24px", fontSize: 39, lineHeight: 1.2 }}>{tagline}</span></div><span style={{ color: "#1a3b70", fontSize: 24, fontWeight: 700 }}>{library}</span></div></div>, size);
}
