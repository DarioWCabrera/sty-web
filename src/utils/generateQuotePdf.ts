import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logoUrl from "../assets/logo.png";

import type { QuoteRequest } from "../types/quote";

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

const getQuoteServicesText = (
  quote: QuoteRequest
): string => {
  if (
    quote.serviceLabels &&
    quote.serviceLabels.length > 0
  ) {
    return quote.serviceLabels.join(" · ");
  }

  return quote.serviceLabel;
};

const getQuoteServiceLabelsCount = (
  quote: QuoteRequest
): number => {
  if (
    quote.serviceLabels &&
    quote.serviceLabels.length > 0
  ) {
    return quote.serviceLabels.length;
  }

  return 1;
};

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
   NÚMERO DE PRESUPUESTO
========================================================= */

export const getQuoteNumber = (
  quote: QuoteRequest
) => {
  const date = new Date(
    quote.quotedAt || quote.createdAt
  );

  const year = date.getFullYear();

  /*
   * Usamos parte del UUID para que cada
   * presupuesto tenga una referencia única.
   */

  const shortId = quote.id
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();

  return `STY-${year}-${shortId}`;
};

/* =========================================================
   GENERAR PDF
========================================================= */

export async function generateQuotePdf(
  quote: QuoteRequest
) {
  if (
    !quote.finalItems ||
    quote.finalItems.length === 0 ||
    quote.finalTotal === undefined
  ) {
    throw new Error(
      "La cotización todavía no tiene un presupuesto STY."
    );
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
  doc.internal.pageSize.getHeight();

const margin = 16;

 

  

  const quoteNumber =
    getQuoteNumber(quote);

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

 /* =======================================================
   HEADER
======================================================= */

doc.setFillColor(...navy);

doc.rect(
  0,
  0,
  pageWidth,
  45,
  "F"
);

/* LOGO */

try {
  const logo = await loadImage(logoUrl);

  doc.addImage(
    logo,
    "PNG",
    margin,
    6,
    28,
    28
  );
} catch {
  // Si el logo no carga, el PDF igualmente se genera.
}

/* IDENTIDAD STY */

doc.setTextColor(255, 255, 255);

doc.setFont(
  "helvetica",
  "bold"
);

doc.setFontSize(15);

doc.text(
  "STY",
  48,
  13
);

doc.setFontSize(8.5);

doc.text(
  "DE ALEJANDRO DE LA MATA",
  48,
  19
);

doc.setFont(
  "helvetica",
  "normal"
);

doc.setFontSize(7.5);

doc.setTextColor(
  205,
  220,
  238
);

doc.text(
  "ENERGÍA SOLAR · PERFORACIONES · ELECTRICIDAD",
  48,
  25
);

/* PRESUPUESTO */

doc.setTextColor(255, 255, 255);

doc.setFont(
  "helvetica",
  "bold"
);

doc.setFontSize(14);

doc.text(
  "PRESUPUESTO",
  pageWidth - margin,
  13,
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
    quote.quotedAt ||
      quote.createdAt
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

  let y = 56;

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
    quote.customerName,
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

/* CUIT OPCIONAL */

if (quote.cuit) {
  doc.text(
    `CUIT: ${quote.cuit}`,
    margin,
    y
  );

  y += 5;
}

/* UBICACIÓN */

doc.text(
  `Ubicación: ${quote.location}`,
  margin,
  y
);

y += 5;

/* WHATSAPP */

doc.text(
  `WhatsApp: ${quote.phone}`,
  margin,
  y
);

/* EMAIL OPCIONAL */

if (quote.email) {
  y += 5;

  doc.text(
    `Email: ${quote.email}`,
    margin,
    y
  );
}   

  /* =======================================================
   SERVICIOS DEL PROYECTO
======================================================= */

  /* =======================================================
   SERVICIOS DEL PROYECTO
======================================================= */

y += 12;

const servicesText =
  getQuoteServicesText(quote);

const servicesCount =
  getQuoteServiceLabelsCount(quote);

/*
 * Dejamos todo el ancho disponible para los servicios.
 * Si el texto es largo, jsPDF lo divide automáticamente
 * en varias líneas.
 */
doc.setFont(
  "helvetica",
  "bold"
);

doc.setFontSize(12);

const serviceLines =
  doc.splitTextToSize(
    servicesText,
    pageWidth - margin * 2 - 10
  );

/*
 * La altura del recuadro aumenta automáticamente
 * según la cantidad de líneas necesarias.
 */
const servicesBoxHeight =
  Math.max(
    29,
    21 + serviceLines.length * 5
  );

doc.setFillColor(...light);

doc.roundedRect(
  margin,
  y,
  pageWidth - margin * 2,
  servicesBoxHeight,
  3,
  3,
  "F"
);

/* TÍTULO */

doc.setTextColor(...blue);

doc.setFont(
  "helvetica",
  "bold"
);

doc.setFontSize(7);

doc.text(
  servicesCount > 1
    ? "SERVICIOS"
    : "SERVICIO",
  margin + 5,
  y + 7
);

/* SERVICIOS SELECCIONADOS */

doc.setTextColor(...navy);

doc.setFontSize(12);

doc.text(
  serviceLines,
  margin + 5,
  y + 14
);

/* CANTIDAD DE SERVICIOS */

const servicesTextHeight =
  serviceLines.length * 5;

const countY =
  y + 17 + servicesTextHeight;

doc.setFont(
  "helvetica",
  "normal"
);

doc.setFontSize(8);

doc.setTextColor(...muted);

doc.text(
  servicesCount > 1
    ? `${servicesCount} servicios incluidos en el presupuesto`
    : "Servicio incluido en el presupuesto",
  margin + 5,
  countY
);

/* AVANZAMOS SEGÚN LA ALTURA REAL DEL RECUADRO */

y += servicesBoxHeight + 10;

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

    body: quote.finalItems.map(
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

  /*
   * jspdf-autotable agrega esta propiedad
   * dinámicamente.
   */

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
      quote.finalTotal
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

  if (quote.quoteNotes) {
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
        quote.quoteNotes,
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

    /*
     * Línea naranja.
     */

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

  /*
 * Reservamos la parte inferior de la hoja para el footer.
 * Si no queda espacio suficiente para vigencia +
 * disclaimer, continuamos en una nueva página.
 */

const footerTop = pageHeight - 27;
const requiredBottomSpace = 30;

if (y + requiredBottomSpace > footerTop) {
  doc.addPage();

  y = 22;
}

  doc.setTextColor(...navy);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.text(
    `Validez del presupuesto: ${quote.validityDays || 7
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

const totalPages =
  doc.getNumberOfPages();

for (
  let pageNumber = 1;
  pageNumber <= totalPages;
  pageNumber++
) {
  doc.setPage(pageNumber);

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
    "STY · Alejandro de la Mata",
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
}
   

  /* =======================================================
     DESCARGA
  ======================================================= */

  const safeName =
    quote.customerName
      .trim()
      .replace(
        /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+/g,
        "-"
      )
      .replace(/^-|-$/g, "");

  doc.save(
    `Presupuesto-STY-${safeName}-${quoteNumber}.pdf`
  );
}