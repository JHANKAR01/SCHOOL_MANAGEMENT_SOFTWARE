
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { StudentResult } from '../../../../types';
import { Buffer } from 'buffer';

/**
 * Sovereign PDF Engine
 * Generates official marksheets using vector graphics (pdf-lib).
 */
export async function generatePDFMarksheet(studentId: string, examId: string): Promise<string> {
  console.log(`[PDF Engine] Rendering marksheet for ${studentId}...`);
  
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
    const { width, height } = page.getSize();
    
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

    // --- HEADER ---
    page.drawText('SOVEREIGN ACADEMY', {
      x: 50, y: height - 50, size: 24, font: fontBold, color: rgb(0.2, 0.2, 0.8)
    });
    
    page.drawText('Excellence in Education | Affiliated to CBSE', {
      x: 50, y: height - 75, size: 10, font: fontReg, color: rgb(0.5, 0.5, 0.5)
    });

    // --- INFO BOX ---
    page.drawRectangle({
      x: 40, y: height - 150, width: width - 80, height: 60,
      borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1
    });

    page.drawText(`STUDENT ID: ${studentId.toUpperCase()}`, { x: 50, y: height - 120, size: 10, font: fontMono });
    page.drawText(`EXAM REF: ${examId.toUpperCase()}`, { x: 300, y: height - 120, size: 10, font: fontMono });
    page.drawText(`DATE: ${new Date().toLocaleDateString()}`, { x: 50, y: height - 135, size: 10, font: fontMono });

    // --- MARKS TABLE ---
    const tableTop = height - 200;
    const subjects = [
      { name: "Mathematics", marks: 95, grade: "A1" },
      { name: "Physics", marks: 88, grade: "A2" },
      { name: "Chemistry", marks: 92, grade: "A1" },
      { name: "English", marks: 85, grade: "A2" },
      { name: "Computer Sci", marks: 98, grade: "A1" }
    ];

    // Table Header
    page.drawRectangle({ x: 40, y: tableTop, width: width - 80, height: 25, color: rgb(0.9, 0.9, 0.9) });
    page.drawText("SUBJECT", { x: 50, y: tableTop + 8, size: 10, font: fontBold });
    page.drawText("MARKS OBTAINED", { x: 300, y: tableTop + 8, size: 10, font: fontBold });
    page.drawText("GRADE", { x: 450, y: tableTop + 8, size: 10, font: fontBold });

    // Table Rows
    let yPos = tableTop - 25;
    subjects.forEach((sub) => {
      page.drawText(sub.name, { x: 50, y: yPos + 8, size: 10, font: fontReg });
      page.drawText(sub.marks.toString(), { x: 300, y: yPos + 8, size: 10, font: fontReg });
      page.drawText(sub.grade, { x: 450, y: yPos + 8, size: 10, font: fontBold });
      
      // Line
      page.drawLine({ start: { x: 40, y: yPos }, end: { x: width - 40, y: yPos }, color: rgb(0.9, 0.9, 0.9), thickness: 1 });
      yPos -= 25;
    });

    // --- FOOTER ---
    page.drawText('This is a computer generated document. No signature required.', {
      x: 50, y: 50, size: 8, font: fontReg, color: rgb(0.6, 0.6, 0.6)
    });

    // Serialize
    const pdfBytes = await pdfDoc.save();
    return `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;

  } catch (e) {
    console.error("PDF Gen Error:", e);
    return "";
  }
}
