import {
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
  PDFDocument,
} from "pdf-lib";
import { calculateLineItem, calculateTotals } from "./calculations";
import { formatCurrency } from "./format";
import { GarageEstimateDraft, LineItem, TotalsComputation } from "./types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 36;
const TABLE_HEADER_HEIGHT = 22;
const ROW_MIN_HEIGHT = 24;
const ROW_LINE_HEIGHT = 11;
const NOTES_LINE_HEIGHT = 12;

const TABLE_COLUMNS = [
  { key: "description", label: "Description", width: 220 },
  { key: "qty", label: "Qty", width: 38 },
  { key: "rate", label: "Rate", width: 70 },
  { key: "discount", label: "Disc", width: 64 },
  { key: "vat", label: "VAT", width: 44 },
  { key: "amount", label: "Amount", width: 87 },
] as const;

interface PageCursor {
  page: PDFPage;
  y: number;
}

const TEXT_COLOR = rgb(0.12, 0.12, 0.14);
const MUTED_TEXT = rgb(0.35, 0.36, 0.4);
const TABLE_BORDER = rgb(0.78, 0.8, 0.85);
const TABLE_HEADER_BG = rgb(0.93, 0.95, 0.98);

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
  const height = Math.max(88, 30 + textHeight);

  page.drawRectangle({
    x,
    y: yTop - height,
    width,
    height,
    borderColor: TABLE_BORDER,
    borderWidth: 1,
  });

  page.drawText(title, {
    x: x + 10,
    y: yTop - 16,
    size: 10,
    font: boldFont,
    color: MUTED_TEXT,
  });

  let y = yTop - 30;
  visibleLines.forEach((line) => {
    page.drawText(line, {
      x: x + 10,
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

  const nameLineHeight = 30;
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

    leftX += logoSize + 10;
  }

  page.drawText(draft.companyProfile.name || "Garage Company", {
    x: leftX,
    y: leftY - 14,
    size: 16,
    font: boldFont,
    color: TEXT_COLOR,
  });

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
      `${draft.documentMeta.docType}`,
      boldFont,
      16,
      rightX,
      rightY - 12
    );

    rightY -= 34;

    drawRightAlignedText(
      page,
      `No: ${buildDocNumber(draft)}`,
      boldFont,
      12,
      rightX,
      rightY
    );

    rightY -= 16;

    drawRightAlignedText(
      page,
      `Date: ${draft.documentMeta.issueDate}`,
      font,
      10,
      rightX,
      rightY,
      MUTED_TEXT
    );

    rightY -= 12;

    if (draft.documentMeta.reference) {
      drawRightAlignedText(
        page,
        `Ref: ${draft.documentMeta.reference}`,
        font,
        10,
        rightX,
        rightY,
        MUTED_TEXT
      );
      rightY -= 12;
    }

    bottomY = Math.min(leftY, rightY);
  }

  return bottomY - 16;
};

const drawTableHeader = (
  page: PDFPage,
  yTop: number,
  font: PDFFont,
  boldFont: PDFFont
): number => {
  const tableWidth = TABLE_COLUMNS.reduce((sum, column) => sum + column.width, 0);

  page.drawRectangle({
    x: MARGIN,
    y: yTop - TABLE_HEADER_HEIGHT,
    width: tableWidth,
    height: TABLE_HEADER_HEIGHT,
    color: TABLE_HEADER_BG,
    borderColor: TABLE_BORDER,
    borderWidth: 1,
  });

  let x = MARGIN;
  TABLE_COLUMNS.forEach((column, index) => {
    page.drawText(column.label, {
      x: x + 6,
      y: yTop - 15,
      size: 9,
      font: boldFont,
      color: MUTED_TEXT,
    });

    x += column.width;
    if (index < TABLE_COLUMNS.length - 1) {
      page.drawLine({
        start: { x, y: yTop - TABLE_HEADER_HEIGHT },
        end: { x, y: yTop },
        color: TABLE_BORDER,
        thickness: 1,
      });
    }
  });

  page.drawLine({
    start: { x: MARGIN, y: yTop - TABLE_HEADER_HEIGHT },
    end: { x: MARGIN + tableWidth, y: yTop - TABLE_HEADER_HEIGHT },
    color: TABLE_BORDER,
    thickness: 1,
  });

  void font;

  return yTop - TABLE_HEADER_HEIGHT;
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
  font: PDFFont
): number => {
  const computed = calculateLineItem(item);
  const tableWidth = TABLE_COLUMNS.reduce((sum, column) => sum + column.width, 0);
  const descLines = wrapText(item.description.trim() || "-", font, 9, 210);
  const rowHeight = Math.max(ROW_MIN_HEIGHT, descLines.length * ROW_LINE_HEIGHT + 8);

  if (index % 2 === 1) {
    page.drawRectangle({
      x: MARGIN,
      y: yTop - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0.985, 0.987, 0.995),
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
  TABLE_COLUMNS.forEach((column, columnIndex) => {
    const cellRight = x + column.width - 6;
    const cellTop = yTop - 10;

    if (column.key === "description") {
      let textY = cellTop;
      descLines.forEach((line) => {
        page.drawText(line, {
          x: x + 6,
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
    if (columnIndex < TABLE_COLUMNS.length - 1) {
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
      draft.documentMeta.issueDate,
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
  font: PDFFont,
  boldFont: PDFFont
): number => {
  const boxWidth = 220;
  const rowHeight = 18;
  const labels = ["Subtotal", "VAT total", "Shipping", "Grand total"];
  const values = [
    formatCurrency(totals.subtotal),
    formatCurrency(totals.vatTotal),
    formatCurrency(totals.shipping),
    formatCurrency(totals.total),
  ];

  const boxHeight = rowHeight * labels.length + 20;
  const x = PAGE_WIDTH - MARGIN - boxWidth;

  page.drawRectangle({
    x,
    y: yTop - boxHeight,
    width: boxWidth,
    height: boxHeight,
    borderColor: TABLE_BORDER,
    borderWidth: 1,
  });

  let y = yTop - 16;
  labels.forEach((label, index) => {
    const value = values[index];
    const isTotal = index === labels.length - 1;

    page.drawText(label, {
      x: x + 10,
      y,
      size: 10,
      font: isTotal ? boldFont : font,
      color: isTotal ? TEXT_COLOR : MUTED_TEXT,
    });

    drawRightAlignedText(
      page,
      value,
      isTotal ? boldFont : font,
      10,
      x + boxWidth - 10,
      y,
      TEXT_COLOR
    );

    if (index === labels.length - 2) {
      page.drawLine({
        start: { x: x + 10, y: y - 5 },
        end: { x: x + boxWidth - 10, y: y - 5 },
        color: TABLE_BORDER,
        thickness: 1,
      });
    }

    y -= rowHeight;
  });

  return yTop - boxHeight;
};

const drawNotes = (
  pdfDoc: PDFDocument,
  cursor: PageCursor,
  notes: string,
  draft: GarageEstimateDraft,
  font: PDFFont,
  boldFont: PDFFont
): PageCursor => {
  const fallbackNotes = "Estimate valid for 14 days.";
  const text = notes.trim() || fallbackNotes;
  const lines = wrapText(text, font, 10, PAGE_WIDTH - MARGIN * 2 - 14);

  let page = cursor.page;
  let y = cursor.y;
  let startIndex = 0;

  while (startIndex < lines.length) {
    const availableHeight = y - MARGIN - 24;
    const maxLinesPerPage = Math.floor((availableHeight - 26) / NOTES_LINE_HEIGHT);

    if (maxLinesPerPage <= 0) {
      const nextPage = startContinuationPage(pdfDoc, draft, font, boldFont);
      page = nextPage.page;
      y = nextPage.y;
      continue;
    }

    const slice = lines.slice(startIndex, startIndex + maxLinesPerPage);
    const blockHeight = 26 + slice.length * NOTES_LINE_HEIGHT;

    page.drawRectangle({
      x: MARGIN,
      y: y - blockHeight,
      width: PAGE_WIDTH - MARGIN * 2,
      height: blockHeight,
      borderColor: TABLE_BORDER,
      borderWidth: 1,
    });

    page.drawText(startIndex === 0 ? "Notes / Terms" : "Notes / Terms (cont.)", {
      x: MARGIN + 8,
      y: y - 16,
      size: 10,
      font: boldFont,
      color: MUTED_TEXT,
    });

    let textY = y - 30;
    slice.forEach((line) => {
      page.drawText(line, {
        x: MARGIN + 8,
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

export const generateGaragePdf = async (
  draft: GarageEstimateDraft
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoImage = await maybeEmbedLogo(pdfDoc, draft.companyProfile.logoDataUrl);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = drawDocumentHeader(page, draft, font, boldFont, logoImage);

  const columnGap = 12;
  const blockWidth = (PAGE_WIDTH - MARGIN * 2 - columnGap) / 2;

  const billToLines = [
    draft.clientDetails.name,
    ...draft.clientDetails.addressLines,
    draft.clientDetails.contactNumber,
    draft.clientDetails.email,
    draft.clientDetails.additionalDetails || "",
  ].filter(Boolean);

  const vehicleLines = [
    `Make / Model: ${draft.vehicleDetails.makeModel || "-"}`,
    `Registration: ${draft.vehicleDetails.registration || "-"}`,
    `Mileage: ${draft.vehicleDetails.mileage || "-"}`,
    ...(draft.includeDocumentMeta
      ? [
          `Reference: ${draft.documentMeta.reference || "-"}`,
          `Date: ${draft.documentMeta.issueDate}`,
        ]
      : []),
  ];

  const leftBottom = drawSectionBlock(
    page,
    "Bill To",
    billToLines,
    MARGIN,
    y,
    blockWidth,
    font,
    boldFont
  );

  const rightBottom = drawSectionBlock(
    page,
    "Vehicle",
    vehicleLines,
    MARGIN + blockWidth + columnGap,
    y,
    blockWidth,
    font,
    boldFont
  );

  y = Math.min(leftBottom, rightBottom) - 18;
  y = drawTableHeader(page, y, font, boldFont);

  draft.lineItems.forEach((lineItem, index) => {
    const descriptionLines = wrapText(
      lineItem.description.trim() || "-",
      font,
      9,
      210
    );
    const rowHeight = Math.max(
      ROW_MIN_HEIGHT,
      descriptionLines.length * ROW_LINE_HEIGHT + 8
    );

    if (y - rowHeight < MARGIN + 150) {
      const nextPage = startContinuationPage(pdfDoc, draft, font, boldFont);
      page = nextPage.page;
      y = drawTableHeader(page, nextPage.y, font, boldFont);
    }

    y = drawLineItemRow(page, y, lineItem, index, font);
  });

  const totals = calculateTotals(draft.lineItems, draft.charges.shipping);

  if (y - 120 < MARGIN + 100) {
    const nextPage = startContinuationPage(pdfDoc, draft, font, boldFont);
    page = nextPage.page;
    y = nextPage.y;
  }

  y = drawTotalsBox(page, y - 8, totals, font, boldFont) - 14;

  const finalCursor = draft.notesTerms.trim()
    ? drawNotes(pdfDoc, { page, y }, draft.notesTerms, draft, font, boldFont)
    : { page, y };

  void finalCursor;

  const pages = pdfDoc.getPages();
  if (pages.length > 1) {
    pages.forEach((pdfPage, index) => {
      drawRightAlignedText(
        pdfPage,
        `Page ${index + 1} of ${pages.length}`,
        font,
        8,
        PAGE_WIDTH - MARGIN,
        MARGIN + 4,
        MUTED_TEXT
      );
    });
  }

  return pdfDoc.save();
};
