import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logoUrl from "../assets/logo.png";

import type { SolarLead } from "../types/lead";

/* =========================================================
   HELPERS
========================================================= */

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const loadImage = (
  src: string
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.src = src;
  });

/* =========================================================
   NÚMERO DE PRESUPUESTO SOLAR
========================================================= */

export const getSolarQuoteNumber = (
  lead: SolarLead
) => {
  const date = new Date(
    lead.solarQuotedAt ||
      lead.createdAt
  );

  const year = date.getFullYear();

  const shortId = lead.id
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();

  return `STY-${year}-${shortId}`;
};

/* =========================================================
   GENERAR PDF
========================================================= */

export async function generateSolarQuotePdf(
  lead: SolarLead
) {
  if (
    !lead.solarQuoteItems ||
    lead.solarQuoteItems.length === 0 ||
    lead.solarQuoteTotal === undefined
  ) {
    throw new Error(
      "La consulta solar todavía no tiene un presupuesto STY."
    );
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const margin = 16;

  const quoteNumber =
    getSolarQuoteNumber(lead);

  /* =======================================================
     COLORES STY
  ======================================================= */

  const navy: [number, number, number] = [
    7, 38, 79,
  ];

  const blue: [number, number, number] = [
    23, 76, 139,
  ];

  const orange: [number, number, number] = [
    247, 128, 18,
  ];

  const muted: [number, number, number] = [
    92, 111, 135,
  ];

  const light: [number, number, number] = [
    244, 248, 252,
  ];

  /* =======================================================
     HEADER
  ======================================================= */

  doc.setFillColor(...navy);

  doc.rect(
    0,
    0,
    pageWidth,
    39,
    "F"
  );

  try {
    const logo =
      await loadImage(logoUrl);

    doc.addImage(
      logo,
      "PNG",
      margin,
      7,
      25,
      25
    );
  } catch {
    // El PDF continúa aunque el logo no cargue.
  }

  doc.setTextColor(255, 255, 255);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(16);

  doc.text(
    "STY",
    45,
    16
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.text(
    "Perforaciones y Energía",
    45,
    22
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(15);

  doc.text(
    "PRESUPUESTO",
    pageWidth - margin,
    14,
    {
      align: "right",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.text(
    quoteNumber,
    pageWidth - margin,
    20,
    {
      align: "right",
    }
  );

  doc.text(
    `Fecha: ${formatDate(
      lead.solarQuotedAt ||
        lead.createdAt
    )}`,
    pageWidth - margin,
    26,
    {
      align: "right",
    }
  );

  /* =======================================================
     CLIENTE
  ======================================================= */

  let y = 51;

  doc.setTextColor(...blue);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.text(
    "DATOS DEL CLIENTE",
    margin,
    y
  );

  y += 6;

  doc.setTextColor(...navy);

  doc.setFontSize(14);

  doc.text(
    lead.name,
    margin,
    y
  );

  y += 7;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.setTextColor(...muted);

  doc.text(
    `Ubicación: ${lead.location}`,
    margin,
    y
  );

  y += 5;

  doc.text(
    `WhatsApp: ${lead.phone}`,
    margin,
    y
  );

  if (lead.email) {
    y += 5;

    doc.text(
      `Email: ${lead.email}`,
      margin,
      y
    );
  }

  /* =======================================================
     PROYECTO SOLAR
  ======================================================= */

  y += 12;

  doc.setFillColor(...light);

  doc.roundedRect(
    margin,
    y,
    pageWidth - margin * 2,
    25,
    3,
    3,
    "F"
  );

  doc.setTextColor(...blue);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(7);

  doc.text(
    "SISTEMA DE ENERGÍA SOLAR",
    margin + 5,
    y + 7
  );

  doc.setTextColor(...navy);

  doc.setFontSize(12);

  doc.text(
    `${lead.estimatedPower.toFixed(
      1
    )} kWp · ${lead.estimatedPanels} paneles`,
    margin + 5,
    y + 15
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(...muted);

  doc.text(
    `Consumo informado: ${lead.monthlyConsumption} kWh/mes`,
    pageWidth - margin - 5,
    y + 14,
    {
      align: "right",
    }
  );

  doc.text(
    `Objetivo: ${lead.objective}`,
    margin + 5,
    y + 21
  );

  y += 35;

  /* =======================================================
     DETALLE
  ======================================================= */

  doc.setTextColor(...blue);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.text(
    "DETALLE DEL PRESUPUESTO",
    margin,
    y
  );

  y += 4;

  autoTable(doc, {
    startY: y,

    margin: {
      left: margin,
      right: margin,
    },

    head: [
      [
        "Concepto",
        "Cant.",
        "Unidad",
        "Precio unit.",
        "Subtotal",
      ],
    ],

    body: lead.solarQuoteItems.map(
      (item) => [
        item.description,
        item.quantity.toString(),
        item.unit,
        formatMoney(
          item.unitPrice
        ),
        formatMoney(
          item.subtotal
        ),
      ]
    ),

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3.5,

      lineColor: [
        218, 227, 236,
      ],

      lineWidth: 0.2,

      textColor: navy,
    },

    headStyles: {
      fillColor: navy,

      textColor: [
        255, 255, 255,
      ],

      fontStyle: "bold",
      fontSize: 7,
    },

    columnStyles: {
      0: {
        cellWidth: 65,
      },

      1: {
        halign: "center",
        cellWidth: 18,
      },

      2: {
        halign: "center",
        cellWidth: 24,
      },

      3: {
        halign: "right",
        cellWidth: 34,
      },

      4: {
        halign: "right",
        cellWidth: 37,
        fontStyle: "bold",
      },
    },

    alternateRowStyles: {
      fillColor: [
        248, 251, 253,
      ],
    },
  });

  const finalY =
    (
      doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    ).lastAutoTable?.finalY ||
    y + 20;

  /* =======================================================
     TOTAL
  ======================================================= */

  y = finalY + 8;

  doc.setFillColor(...navy);

  doc.roundedRect(
    pageWidth - margin - 74,
    y,
    74,
    22,
    3,
    3,
    "F"
  );

  doc.setTextColor(
    190,
    214,
    235
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(7);

  doc.text(
    "TOTAL PRESUPUESTO",
    pageWidth - margin - 69,
    y + 7
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(17);

  doc.text(
    formatMoney(
      lead.solarQuoteTotal
    ),
    pageWidth - margin - 5,
    y + 16,
    {
      align: "right",
    }
  );

  y += 32;

  /* =======================================================
     OBSERVACIONES
  ======================================================= */

  if (lead.solarQuoteNotes) {
    doc.setTextColor(...blue);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8);

    doc.text(
      "OBSERVACIONES",
      margin,
      y
    );

    y += 6;

    doc.setFillColor(
      255,
      248,
      237
    );

    const noteLines =
      doc.splitTextToSize(
        lead.solarQuoteNotes,
        pageWidth -
          margin * 2 -
          10
      );

    const boxHeight =
      Math.max(
        18,
        noteLines.length * 4.5 +
          10
      );

    doc.roundedRect(
      margin,
      y,
      pageWidth -
        margin * 2,
      boxHeight,
      2,
      2,
      "F"
    );

    doc.setFillColor(...orange);

    doc.rect(
      margin,
      y,
      1.5,
      boxHeight,
      "F"
    );

    doc.setTextColor(...muted);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      noteLines,
      margin + 6,
      y + 7
    );

    y += boxHeight + 9;
  }

  /* =======================================================
     VIGENCIA
  ======================================================= */

  doc.setTextColor(...navy);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.text(
    `Validez del presupuesto: ${
      lead.solarQuoteValidityDays ||
      7
    } días`,
    margin,
    y
  );

  y += 7;

  doc.setTextColor(...muted);

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(7.5);

  const disclaimer =
    "Los valores indicados corresponden a la cotización realizada por STY y poseen la vigencia especificada. Vencido dicho plazo, podrán ser actualizados debido a variaciones en materiales, proveedores y demás costos asociados al trabajo.";

  const disclaimerLines =
    doc.splitTextToSize(
      disclaimer,
      pageWidth -
        margin * 2
    );

  doc.text(
    disclaimerLines,
    margin,
    y
  );

  /* =======================================================
     FOOTER
  ======================================================= */

  const pageHeight =
    doc.internal.pageSize.getHeight();

  doc.setDrawColor(
    220,
    228,
    236
  );

  doc.line(
    margin,
    pageHeight - 27,
    pageWidth - margin,
    pageHeight - 27
  );

  doc.setTextColor(...navy);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.text(
    "STY Perforaciones y Energía",
    margin,
    pageHeight - 19
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setTextColor(...muted);

  doc.setFontSize(7);

  doc.text(
    "Tres Arroyos y zona",
    margin,
    pageHeight - 14
  );

  doc.text(
    "WhatsApp: +54 2983 587482  |  Instagram: @sty.energiasolar",
    margin,
    pageHeight - 9
  );

  doc.setTextColor(...navy);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    `Presupuesto ${quoteNumber}`,
    pageWidth - margin,
    pageHeight - 16,
    {
      align: "right",
    }
  );

  /* =======================================================
     DESCARGA
  ======================================================= */

  const safeName =
    lead.name
      .trim()
      .replace(
        /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+/g,
        "-"
      )
      .replace(/^-|-$/g, "");

  doc.save(
    `Presupuesto-STY-Solar-${safeName}-${quoteNumber}.pdf`
  );
}