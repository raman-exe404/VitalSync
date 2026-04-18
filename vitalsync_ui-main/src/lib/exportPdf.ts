import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface HealthLog {
  water: number; sleep: number; stress: number;
  temperature: number; symptoms?: string[]; created_at: string;
}

interface StrokeInfo {
  last_stroke_date?: string;
  stroke_notes?: string;
}

interface ProfileInfo {
  name: string;
  phone?: string;
  age?: number;
  genotype?: string;
  location?: string;
  role?: string;
}

const STRESS_LABEL: Record<number, string> = { 2: "Low 😌", 5: "Medium 😰", 9: "High 😫" };
function stressLabel(v: number) {
  if (v <= 3) return STRESS_LABEL[2];
  if (v <= 6) return STRESS_LABEL[5];
  return STRESS_LABEL[9];
}

export function exportMedicalPDF(
  profile: ProfileInfo & StrokeInfo,
  logs: HealthLog[],
  from: Date,
  to: Date
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(192, 57, 43); // brand red
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("VitalSync — Medical Report", margin, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, margin, 20);
  doc.text(`Period: ${from.toLocaleDateString("en-GB")} – ${to.toLocaleDateString("en-GB")}`, pageW / 2, 20, { align: "center" });

  let y = 36;
  doc.setTextColor(30, 30, 30);

  // ── Patient Info ─────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Information", margin, y); y += 6;
  doc.setDrawColor(192, 57, 43);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y); y += 5;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 } },
    body: [
      ["Name",     profile.name || "—"],
      ["Phone",    profile.phone || "—"],
      ["Age",      profile.age ? `${profile.age} years` : "—"],
      ["Genotype", profile.genotype || "—"],
      ["Location", profile.location || "—"],
      ["Role",     profile.role || "—"],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Stroke History ───────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Stroke / Crisis History", margin, y); y += 6;
  doc.line(margin, y, pageW - margin, y); y += 5;

  if (profile.last_stroke_date) {
    const daysSince = Math.floor(
      (Date.now() - new Date(profile.last_stroke_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 } },
      body: [
        ["Last Event",  new Date(profile.last_stroke_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
        ["Days Since",  `${daysSince} days`],
        ["Notes",       profile.stroke_notes || "—"],
      ],
    });
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("No stroke history recorded.", margin, y + 5);
    doc.setTextColor(30, 30, 30);
    y += 10;
  }
  y = (doc as any).lastAutoTable?.finalY + 8 || y + 8;

  // ── Health Logs ──────────────────────────────────────────
  const filtered = logs.filter(l => {
    const d = new Date(l.created_at);
    return d >= from && d <= to;
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Health Logs (${filtered.length} entries)`, margin, y); y += 6;
  doc.line(margin, y, pageW - margin, y); y += 3;

  if (filtered.length === 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("No health logs found for the selected period.", margin, y + 5);
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Date", "Water", "Sleep", "Stress", "Temp (°C)", "Symptoms"]],
      body: filtered.map(l => [
        new Date(l.created_at).toLocaleDateString("en-GB"),
        `${l.water} L`,
        `${l.sleep} h`,
        stressLabel(l.stress),
        `${l.temperature}°C`,
        l.symptoms?.join(", ") || "—",
      ]),
      headStyles: { fillColor: [192, 57, 43], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [250, 245, 243] },
      styles: { cellPadding: 2.5 },
    });
  }

  // ── Footer ───────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`VitalSync Medical Report — Page ${i} of ${pageCount}`, pageW / 2, 290, { align: "center" });
  }

  const filename = `VitalSync_Report_${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
