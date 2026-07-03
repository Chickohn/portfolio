import {
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
  PDFDocument,
} from "pdf-lib";
import { calculateLineItem, calculateTotals } from "./calculations";
import { formatCurrency, formatDateLong } from "./format";
import {
  GarageEstimateDraft,
  LineItem,
  SectionToggles,
  TotalsComputation,
  WorkedDayEntry,
} from "./types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const TABLE_HEADER_HEIGHT = 24;
const ROW_MIN_HEIGHT = 26;
const ROW_LINE_HEIGHT = 11;
const NOTES_LINE_HEIGHT = 12;

const TEXT_COLOR = rgb(0.1, 0.11, 0.14);
const MUTED_TEXT = rgb(0.38, 0.4, 0.45);
const ACCENT_COLOR = rgb(0.12, 0.28, 0.58);
const TABLE_BORDER = rgb(0.82, 0.84, 0.88);
const TABLE_HEADER_BG = rgb(0.95, 0.96, 0.98);
const SECTION_BG = rgb(0.98, 0.985, 0.995);

interface TableColumn {
  key: string;
  label: string;
  width: number;
}

interface PageCursor {
  page: PDFPage;
  y: number;
}

const wrapText = (
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] => {
  const normalized = text.replace(/\r/g, "");
  const paragraphs = normalized.split("\n");
  const lines: string[] = [];

  const splitLongWord = (word: string): string[] => {
    const output: string[] = [];
    let current = "";

    for (const char of word) {
      const candidate = current + char;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
        current = candidate;
      } else {
        output.push(current);
        current = char;
      }
    }

    if (current) {
      output.push(current);
    }

    return output;
  };

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    words.forEach((word) => {
      const segments =
        font.widthOfTextAtSize(word, size) > maxWidth
          ? splitLongWord(word)
          : [word];

      segments.forEach((segment) => {
        const candidate = current ? `${current} ${segment}` : segment;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          current = candidate;
        } else {
          if (current) {
            lines.push(current);
          }
          current = segment;
        }
      });
    });

    if (current) {
      lines.push(current);
    }
  }

  return lines.length > 0 ? lines : [""];
};

const drawRightAlignedText = (
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  rightX: number,
  y: number,
  color = TEXT_COLOR
): void => {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: rightX - textWidth,
    y,
    size,
    font,
    color,
  });
};

const getDisplayLines = (lines: string[]): string[] => {
  const filtered = lines.map((line) => line.trim()).filter(Boolean);
  return filtered.length > 0 ? filtered : ["-"];
};

const buildDocNumber = (draft: GarageEstimateDraft): string =>
  `${draft.documentMeta.docNumberPrefix}${draft.documentMeta.docNumber}`;

const getTableColumns = (toggles: SectionToggles): TableColumn[] => {
  const columns: TableColumn[] = [
    { key: "description", label: "Description", width: 0 },
  ];

  columns.push({ key: "qty", label: "Qty", width: 48 });
  columns.push({ key: "rate", label: "Unit rate", width: 78 });

  if (toggles.lineItemDiscount) {
    columns.push({ key: "discount", label: "Disc", width: 64 });
  }

  if (toggles.lineItemVat) {
    columns.push({ key: "vat", label: "VAT", width: 44 });
  }

  columns.push({ key: "amount", label: "Amount", width: 88 });

  const fixedWidth = columns.slice(1).reduce((sum, column) => sum + column.width, 0);
  columns[0].width = PAGE_WIDTH - MARGIN * 2 - fixedWidth;

  return columns;
};

const getTableWidth = (columns: TableColumn[]): number =>
  columns.reduce((sum, column) => sum + column.width, 0);

const maybeEmbedLogo = async (
  pdfDoc: PDFDocument,
  dataUrl?: string
): Promise<PDFImage | null> => {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return null;
  }

  try {
    const response = await fetch(dataUrl);
    const bytes = await response.arrayBuffer();
    if (dataUrl.startsWith("data:image/png")) {
      return await pdfDoc.embedPng(bytes);
    }

    if (
      dataUrl.startsWith("data:image/jpeg") ||
      dataUrl.startsWith("data:image/jpg")
    ) {
      return await pdfDoc.embedJpg(bytes);
    }

    return null;
  } catch {
    return null;
  }
};

const drawSectionBlock = (
  page: PDFPage,
  title: string,
  lines: string[],
  x: number,
  yTop: number,
  width: number,
  font: PDFFont,
  boldFont: PDFFont
): number => {
  const visibleLines = getDisplayLines(lines);
  const textHeight = visibleLines.length * 12;
  const height = Math.max(72, 28 + textHeight);

  page.drawRectangle({
    x,
    y: yTop - height,
    width,
    height,
    color: SECTION_BG,
    borderColor: TABLE_BORDER,
    borderWidth: 1,
  });

  page.drawText(title.toUpperCase(), {
    x: x + 12,
    y: yTop - 16,
    size: 8,
    font: boldFont,
    color: ACCENT_COLOR,
  });

  let y = yTop - 30;
  visibleLines.forEach((line) => {
    page.drawText(line, {
      x: x + 12,
      y,
      size: 10,
      font,
      color: TEXT_COLOR,
    });
    y -= 12;
  });

  return yTop - height;
};

const drawDocumentHeader = (
  page: PDFPage,
  draft: GarageEstimateDraft,
  font: PDFFont,
  boldFont: PDFFont,
  logoImage: PDFImage | null
): number => {
  let leftX = MARGIN;
  let leftY = PAGE_HEIGHT - MARGIN;

  const contactLines = [
    ...getDisplayLines(draft.companyProfile.addressLines),
    draft.companyProfile.phone || "",
    draft.companyProfile.email || "",
    draft.companyProfile.vatNumber
      ? `VAT No: ${draft.companyProfile.vatNumber}`
      : "",
  ].filter(Boolean);

  const nameLineHeight = draft.companyProfile.tagline ? 42 : 30;
  const contactLineHeight = 11;
  const textBlockHeight = nameLineHeight + contactLines.length * contactLineHeight;

  if (logoImage) {
    const logoSize = textBlockHeight;
    const imgW = logoImage.width;
    const imgH = logoImage.height;
    const scale = Math.min(logoSize / imgW, logoSize / imgH, 1);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (logoSize - drawW) / 2;
    const offsetY = (logoSize - drawH) / 2;

    page.drawImage(logoImage, {
      x: MARGIN + offsetX,
      y: leftY - logoSize + offsetY,
      width: drawW,
      height: drawH,
    });

    leftX += logoSize + 12;
  }

  page.drawText(draft.companyProfile.name || "Company", {
    x: leftX,
    y: leftY - 14,
    size: 17,
    font: boldFont,
    color: TEXT_COLOR,
  });

  if (draft.companyProfile.tagline?.trim()) {
    page.drawText(draft.companyProfile.tagline.trim(), {
      x: leftX,
      y: leftY - 28,
      size: 10,
      font,
      color: MUTED_TEXT,
    });
  }

  leftY -= nameLineHeight;

  contactLines.forEach((line) => {
    page.drawText(line, {
      x: leftX,
      y: leftY,
      size: 9,
      font,
      color: MUTED_TEXT,
    });
    leftY -= contactLineHeight;
  });

  let bottomY = leftY;

  if (draft.includeDocumentMeta) {
    const rightX = PAGE_WIDTH - MARGIN;
    let rightY = PAGE_HEIGHT - MARGIN;

    drawRightAlignedText(
      page,
      draft.documentMeta.docType.toUpperCase(),
      boldFont,
      18,
      rightX,
      rightY - 12,
      ACCENT_COLOR
    );

    rightY -= 36;

    drawRightAlignedText(
      page,
      buildDocNumber(draft),
      boldFont,
      12,
      rightX,
      rightY
    );

    rightY -= 16;

    drawRightAlignedText(
      page,
      `${draft.documentMeta.docType} date: ${formatDateLong(draft.documentMeta.issueDate)}`,
      font,
      9,
      rightX,
      rightY,
      MUTED_TEXT
    );

    rightY -= 12;

    if (draft.documentMeta.dueDate) {
      drawRightAlignedText(
        page,
        `Payment due: ${formatDateLong(draft.documentMeta.dueDate)}`,
        font,
        9,
        rightX,
        rightY,
        MUTED_TEXT
      );
      rightY -= 12;
    }

    if (draft.documentMeta.reference) {
      drawRightAlignedText(
        page,
        `Reference: ${draft.documentMeta.reference}`,
        font,
        9,
        rightX,
        rightY,
        MUTED_TEXT
      );
      rightY -= 12;
    }

    bottomY = Math.min(leftY, rightY);
  }

  const headerBottom = bottomY - 10;
  page.drawLine({
    start: { x: MARGIN, y: headerBottom },
    end: { x: PAGE_WIDTH - MARGIN, y: headerBottom },
    color: ACCENT_COLOR,
    thickness: 1.5,
  });

  return headerBottom - 18;
};

const drawTableHeader = (
  page: PDFPage,
  yTop: number,
  columns: TableColumn[],
  font: PDFFont,
  boldFont: PDFFont,
  title = "Invoice items"
): number => {
  const tableWidth = getTableWidth(columns);

  page.drawText(title, {
    x: MARGIN,
    y: yTop + 6,
    size: 10,
    font: boldFont,
    color: TEXT_COLOR,
  });

  const headerTop = yTop - 4;

  page.drawRectangle({
    x: MARGIN,
    y: headerTop - TABLE_HEADER_HEIGHT,
    width: tableWidth,
    height: TABLE_HEADER_HEIGHT,
    color: TABLE_HEADER_BG,
    borderColor: TABLE_BORDER,
    borderWidth: 1,
  });

  let x = MARGIN;
  columns.forEach((column, index) => {
    const isNumeric = column.key !== "description";
    const labelX = isNumeric ? x + column.width - 8 : x + 8;
    const label = column.label;

    if (isNumeric) {
      drawRightAlignedText(page, label, boldFont, 8, labelX, headerTop - 15, MUTED_TEXT);
    } else {
      page.drawText(label, {
        x: labelX,
        y: headerTop - 15,
        size: 8,
        font: boldFont,
        color: MUTED_TEXT,
      });
    }

    x += column.width;
    if (index < columns.length - 1) {
      page.drawLine({
        start: { x, y: headerTop - TABLE_HEADER_HEIGHT },
        end: { x, y: headerTop },
        color: TABLE_BORDER,
        thickness: 1,
      });
    }
  });

  void font;

  return headerTop - TABLE_HEADER_HEIGHT;
};

const formatQuantity = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2);
};

const formatDiscount = (item: LineItem): string => {
  if (item.discountType === "percent") {
    return `${item.discountValue.toFixed(2)}%`;
  }

  if (item.discountType === "fixed") {
    return formatCurrency(item.discountValue);
  }

  return "-";
};

const drawLineItemRow = (
  page: PDFPage,
  yTop: number,
  item: LineItem,
  index: number,
  columns: TableColumn[],
  font: PDFFont
): number => {
  const computed = calculateLineItem(item);
  const tableWidth = getTableWidth(columns);
  const descriptionColumn = columns[0];
  const descLines = wrapText(
    item.description.trim() || "-",
    font,
    9,
    descriptionColumn.width - 12
  );
  const rowHeight = Math.max(ROW_MIN_HEIGHT, descLines.length * ROW_LINE_HEIGHT + 10);

  if (index % 2 === 1) {
    page.drawRectangle({
      x: MARGIN,
      y: yTop - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0.99, 0.995, 1),
    });
  }

  page.drawRectangle({
    x: MARGIN,
    y: yTop - rowHeight,
    width: tableWidth,
    height: rowHeight,
    borderColor: TABLE_BORDER,
    borderWidth: 1,
  });

  let x = MARGIN;
  columns.forEach((column, columnIndex) => {
    const cellRight = x + column.width - 8;
    const cellTop = yTop - 11;

    if (column.key === "description") {
      let textY = cellTop;
      descLines.forEach((line) => {
        page.drawText(line, {
          x: x + 8,
          y: textY,
          size: 9,
          font,
          color: TEXT_COLOR,
        });
        textY -= ROW_LINE_HEIGHT;
      });
    }

    if (column.key === "qty") {
      drawRightAlignedText(
        page,
        formatQuantity(item.qty),
        font,
        9,
        cellRight,
        cellTop
      );
    }

    if (column.key === "rate") {
      drawRightAlignedText(
        page,
        formatCurrency(item.rate),
        font,
        9,
        cellRight,
        cellTop
      );
    }

    if (column.key === "discount") {
      drawRightAlignedText(page, formatDiscount(item), font, 9, cellRight, cellTop);
    }

    if (column.key === "vat") {
      drawRightAlignedText(
        page,
        `${item.vatRate}%`,
        font,
        9,
        cellRight,
        cellTop
      );
    }

    if (column.key === "amount") {
      drawRightAlignedText(
        page,
        formatCurrency(computed.net),
        font,
        9,
        cellRight,
        cellTop
      );
    }

    x += column.width;
    if (columnIndex < columns.length - 1) {
      page.drawLine({
        start: { x, y: yTop },
        end: { x, y: yTop - rowHeight },
        color: TABLE_BORDER,
        thickness: 1,
      });
    }
  });

  return yTop - rowHeight;
};

const startContinuationPage = (
  pdfDoc: PDFDocument,
  draft: GarageEstimateDraft,
  font: PDFFont,
  boldFont: PDFFont
): PageCursor => {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const title = draft.includeDocumentMeta
    ? `${draft.documentMeta.docType} ${buildDocNumber(draft)} (continued)`
    : "Continued";

  page.drawText(title, {
    x: MARGIN,
    y: PAGE_HEIGHT - MARGIN - 12,
    size: 12,
    font: boldFont,
    color: TEXT_COLOR,
  });

  if (draft.includeDocumentMeta) {
    drawRightAlignedText(
      page,
      formatDateLong(draft.documentMeta.issueDate),
      font,
      10,
      PAGE_WIDTH - MARGIN,
      PAGE_HEIGHT - MARGIN - 12,
      MUTED_TEXT
    );
  }

  return {
    page,
    y: PAGE_HEIGHT - MARGIN - 28,
  };
};

const drawTotalsBox = (
  page: PDFPage,
  yTop: number,
  totals: TotalsComputation,
  draft: GarageEstimateDraft,
  font: PDFFont,
  boldFont: PDFFont
): number => {
  const boxWidth = 232;
  const rowHeight = 18;
  const includeShipping = draft.includeShipping && draft.sectionToggles.shipping;
  const totalLabel =
    draft.documentMeta.docType === "Invoice" ? "Total due" : "Grand total";

  const rows: Array<{ label: string; value: string; isTotal?: boolean }> = [
    { label: "Subtotal", value: formatCurrency(totals.subtotal) },
    {
      label: "VAT",
      value: draft.vatNotRegistered
        ? "Not VAT registered"
        : formatCurrency(totals.vatTotal),
    },
    ...(includeShipping
      ? [{ label: "Shipping", value: formatCurrency(totals.shipping) }]
      : []),
    { label: totalLabel, value: formatCurrency(totals.total), isTotal: true },
  ];
  const separatorIndex = rows.findIndex((row) => row.isTotal) - 1;

  const boxHeight = rowHeight * rows.length + 22;
  const x = PAGE_WIDTH - MARGIN - boxWidth;

  page.drawRectangle({
    x,
    y: yTop - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: SECTION_BG,
    borderColor: TABLE_BORDER,
    borderWidth: 1,
  });

  let y = yTop - 18;
  rows.forEach((row, index) => {
    page.drawText(row.label, {
      x: x + 12,
      y,
      size: 10,
      font: row.isTotal ? boldFont : font,
      color: row.isTotal ? TEXT_COLOR : MUTED_TEXT,
    });

    const valueFont = row.isTotal ? boldFont : font;
    const valueSize = row.label === "VAT" && draft.vatNotRegistered ? 8 : 10;
    drawRightAlignedText(
      page,
      row.value,
      valueFont,
      valueSize,
      x + boxWidth - 12,
      y,
      TEXT_COLOR
    );

    if (index === separatorIndex) {
      page.drawLine({
        start: { x: x + 12, y: y - 5 },
        end: { x: x + boxWidth - 12, y: y - 5 },
        color: TABLE_BORDER,
        thickness: 1,
      });
    }

    y -= rowHeight;
  });

  return yTop - boxHeight;
};

const drawWorkedDaysTable = (
  pdfDoc: PDFDocument,
  cursor: PageCursor,
  workedDays: WorkedDayEntry[],
  draft: GarageEstimateDraft,
  font: PDFFont,
  boldFont: PDFFont
): PageCursor => {
  if (workedDays.length === 0) {
    return cursor;
  }

  const columns = [
    { label: "Date", width: 130 },
    { label: "Day", width: 90 },
    { label: "Days", width: 52 },
    { label: "Amount", width: 90 },
  ];
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const headerHeight = 22;
  const rowHeight = 20;

  let page = cursor.page;
  let y = cursor.y - 8;

  const drawHeader = () => {
    page.drawText("Worked days", {
      x: MARGIN,
      y: y + 6,
      size: 10,
      font: boldFont,
      color: TEXT_COLOR,
    });

    const headerTop = y - 4;
    page.drawRectangle({
      x: MARGIN,
      y: headerTop - headerHeight,
      width: tableWidth,
      height: headerHeight,
      color: TABLE_HEADER_BG,
      borderColor: TABLE_BORDER,
      borderWidth: 1,
    });

    let x = MARGIN;
    columns.forEach((column, index) => {
      const isNumeric = column.label === "Days" || column.label === "Amount";
      if (isNumeric) {
        drawRightAlignedText(
          page,
          column.label,
          boldFont,
          8,
          x + column.width - 8,
          headerTop - 14,
          MUTED_TEXT
        );
      } else {
        page.drawText(column.label, {
          x: x + 8,
          y: headerTop - 14,
          size: 8,
          font: boldFont,
          color: MUTED_TEXT,
        });
      }

      x += column.width;
      if (index < columns.length - 1) {
        page.drawLine({
          start: { x, y: headerTop - headerHeight },
          end: { x, y: headerTop },
          color: TABLE_BORDER,
          thickness: 1,
        });
      }
    });

    y = headerTop - headerHeight;
  };

  drawHeader();

  workedDays.forEach((entry, index) => {
    if (y - rowHeight < MARGIN + 80) {
      const nextPage = startContinuationPage(pdfDoc, draft, font, boldFont);
      page = nextPage.page;
      y = nextPage.y;
      drawHeader();
    }

    const amount = entry.days * entry.rate;
    const rowTop = y;

    if (index % 2 === 1) {
      page.drawRectangle({
        x: MARGIN,
        y: rowTop - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.99, 0.995, 1),
      });
    }

    page.drawRectangle({
      x: MARGIN,
      y: rowTop - rowHeight,
      width: tableWidth,
      height: rowHeight,
      borderColor: TABLE_BORDER,
      borderWidth: 1,
    });

    let x = MARGIN;
    const values = [
      formatDateLong(entry.date),
      entry.dayName || "-",
      formatQuantity(entry.days),
      formatCurrency(amount),
    ];

    values.forEach((value, columnIndex) => {
      const column = columns[columnIndex];
      const isNumeric = columnIndex >= 2;
      const textY = rowTop - 13;

      if (isNumeric) {
        drawRightAlignedText(page, value, font, 9, x + column.width - 8, textY);
      } else {
        page.drawText(value, {
          x: x + 8,
          y: textY,
          size: 9,
          font,
          color: TEXT_COLOR,
        });
      }

      x += column.width;
      if (columnIndex < columns.length - 1) {
        page.drawLine({
          start: { x, y: rowTop },
          end: { x, y: rowTop - rowHeight },
          color: TABLE_BORDER,
          thickness: 1,
        });
      }
    });

    y -= rowHeight;
  });

  return { page, y: y - 14 };
};

const drawNotes = (
  pdfDoc: PDFDocument,
  cursor: PageCursor,
  notes: string,
  draft: GarageEstimateDraft,
  font: PDFFont,
  boldFont: PDFFont,
  title = "Notes / Terms"
): PageCursor => {
  const text = notes.trim();
  if (!text) {
    return cursor;
  }

  const lines = wrapText(text, font, 10, PAGE_WIDTH - MARGIN * 2 - 24);

  let page = cursor.page;
  let y = cursor.y;
  let startIndex = 0;

  while (startIndex < lines.length) {
    const availableHeight = y - MARGIN - 24;
    const maxLinesPerPage = Math.floor((availableHeight - 28) / NOTES_LINE_HEIGHT);

    if (maxLinesPerPage <= 0) {
      const nextPage = startContinuationPage(pdfDoc, draft, font, boldFont);
      page = nextPage.page;
      y = nextPage.y;
      continue;
    }

    const slice = lines.slice(startIndex, startIndex + maxLinesPerPage);
    const blockHeight = 28 + slice.length * NOTES_LINE_HEIGHT;

    page.drawRectangle({
      x: MARGIN,
      y: y - blockHeight,
      width: PAGE_WIDTH - MARGIN * 2,
      height: blockHeight,
      color: SECTION_BG,
      borderColor: TABLE_BORDER,
      borderWidth: 1,
    });

    page.drawText(startIndex === 0 ? title : `${title} (cont.)`, {
      x: MARGIN + 12,
      y: y - 16,
      size: 8,
      font: boldFont,
      color: ACCENT_COLOR,
    });

    let textY = y - 30;
    slice.forEach((line) => {
      page.drawText(line, {
        x: MARGIN + 12,
        y: textY,
        size: 10,
        font,
        color: TEXT_COLOR,
      });
      textY -= NOTES_LINE_HEIGHT;
    });

    y -= blockHeight + 12;
    startIndex += slice.length;

    if (startIndex < lines.length) {
      const nextPage = startContinuationPage(pdfDoc, draft, font, boldFont);
      page = nextPage.page;
      y = nextPage.y;
    }
  }

  return { page, y };
};

const drawInfoSections = (
  page: PDFPage,
  draft: GarageEstimateDraft,
  y: number,
  font: PDFFont,
  boldFont: PDFFont
): number => {
  const columnGap = 14;
  const blockWidth = (PAGE_WIDTH - MARGIN * 2 - columnGap) / 2;
  const sections: Array<{ title: string; lines: string[] }> = [];

  const billToLines = [
    draft.clientDetails.name,
    ...draft.clientDetails.addressLines,
    draft.clientDetails.contactNumber,
    draft.clientDetails.email,
    draft.clientDetails.additionalDetails || "",
  ].filter(Boolean);

  sections.push({ title: "Billed to", lines: billToLines });

  if (draft.sectionToggles.vehicle) {
    sections.push({
      title: "Vehicle",
      lines: [
        `Make / Model: ${draft.vehicleDetails.makeModel || "-"}`,
        `Registration: ${draft.vehicleDetails.registration || "-"}`,
        `Mileage: ${draft.vehicleDetails.mileage || "-"}`,
      ],
    });
  }

  if (draft.sectionToggles.workPeriod) {
    const periodLines = [
      draft.workPeriod.startDate && draft.workPeriod.endDate
        ? `${formatDateLong(draft.workPeriod.startDate)} to ${formatDateLong(draft.workPeriod.endDate)}`
        : draft.workPeriod.startDate
          ? `From ${formatDateLong(draft.workPeriod.startDate)}`
          : draft.workPeriod.endDate
            ? `Until ${formatDateLong(draft.workPeriod.endDate)}`
            : "-",
      draft.workPeriod.summaryLine || "",
    ].filter(Boolean);

    sections.push({ title: "Work period", lines: periodLines });
  }

  draft.customSections
    .filter((section) => section.enabled)
    .forEach((section) => {
      sections.push({
        title: section.title,
        lines: section.lines,
      });
    });

  if (sections.length === 0) {
    return y;
  }

  const rows: Array<typeof sections> = [];
  for (let index = 0; index < sections.length; index += 2) {
    rows.push(sections.slice(index, index + 2));
  }

  let currentY = y;
  rows.forEach((row) => {
    const left = row[0];
    const right = row[1];

    const leftBottom = drawSectionBlock(
      page,
      left.title,
      left.lines,
      MARGIN,
      currentY,
      blockWidth,
      font,
      boldFont
    );

    const rightBottom = right
      ? drawSectionBlock(
          page,
          right.title,
          right.lines,
          MARGIN + blockWidth + columnGap,
          currentY,
          blockWidth,
          font,
          boldFont
        )
      : currentY;

    currentY = Math.min(leftBottom, rightBottom) - 16;
  });

  return currentY;
};

export const generateGaragePdf = async (
  draft: GarageEstimateDraft
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoImage = await maybeEmbedLogo(pdfDoc, draft.companyProfile.logoDataUrl);
  const tableColumns = getTableColumns(draft.sectionToggles);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = drawDocumentHeader(page, draft, font, boldFont, logoImage);
  y = drawInfoSections(page, draft, y, font, boldFont);

  y = drawTableHeader(page, y, tableColumns, font, boldFont);

  draft.lineItems.forEach((lineItem, index) => {
    const descriptionColumn = tableColumns[0];
    const descriptionLines = wrapText(
      lineItem.description.trim() || "-",
      font,
      9,
      descriptionColumn.width - 12
    );
    const rowHeight = Math.max(
      ROW_MIN_HEIGHT,
      descriptionLines.length * ROW_LINE_HEIGHT + 10
    );

    if (y - rowHeight < MARGIN + 150) {
      const nextPage = startContinuationPage(pdfDoc, draft, font, boldFont);
      page = nextPage.page;
      y = drawTableHeader(page, nextPage.y, tableColumns, font, boldFont, "Items (cont.)");
    }

    y = drawLineItemRow(page, y, lineItem, index, tableColumns, font);
  });

  const effectiveShipping =
    draft.includeShipping && draft.sectionToggles.shipping
      ? draft.charges.shipping
      : 0;
  const totals = calculateTotals(draft.lineItems, effectiveShipping);

  if (y - 120 < MARGIN + 100) {
    const nextPage = startContinuationPage(pdfDoc, draft, font, boldFont);
    page = nextPage.page;
    y = nextPage.y;
  }

  y = drawTotalsBox(page, y - 10, totals, draft, font, boldFont) - 16;

  let cursor: PageCursor = { page, y };

  if (draft.sectionToggles.workedDays) {
    cursor = drawWorkedDaysTable(pdfDoc, cursor, draft.workedDays, draft, font, boldFont);
  }

  if (draft.sectionToggles.paymentDetails) {
    const paymentLines = draft.paymentDetails.lines.filter(Boolean);
    if (paymentLines.length > 0) {
      cursor = drawNotes(
        pdfDoc,
        cursor,
        paymentLines.join("\n"),
        draft,
        font,
        boldFont,
        draft.paymentDetails.title || "Payment details"
      );
    }
  }

  if (draft.notesTerms.trim()) {
    cursor = drawNotes(pdfDoc, cursor, draft.notesTerms, draft, font, boldFont);
  }

  void cursor;

  const pages = pdfDoc.getPages();
  pages.forEach((pdfPage, index) => {
    drawRightAlignedText(
      pdfPage,
      `${index + 1} of ${pages.length}`,
      font,
      8,
      PAGE_WIDTH - MARGIN,
      MARGIN + 4,
      MUTED_TEXT
    );
  });

  return pdfDoc.save();
};
