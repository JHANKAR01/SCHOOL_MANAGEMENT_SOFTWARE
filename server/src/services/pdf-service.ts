import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Buffer } from 'buffer';
import prisma from '../db';

/**
 * Sovereign PDF Engine
 * Generates official marksheets using vector graphics (pdf-lib).
 */
export async function generatePDFMarksheet(studentId: string, resultId: string): Promise<string> {
  console.log(`[PDF Engine] Rendering marksheet for Result: ${resultId}...`);

  try {
    // 1. Fetch Data
    const result = await prisma.result.findFirst({
      where: { id: resultId, student_id: studentId },
      include: {
        Exam: true,
        Student: {
          include: {
            enrollments: {
              where: { academic_year: { is_current: true } },
              include: { class: true }
            }
          }
        },
        marks: {
          include: { subject: true }
        }
      }
    });

    if (!result || !result.Student) {
      throw new Error("Result or Student not found");
    }

    const student = result.Student;
    const currentClass = student.enrollments[0]?.class;
    const className = currentClass ? `${currentClass.grade}-${currentClass.section}` : "N/A";

    // 2. Create PDF
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
      x: 40, y: height - 160, width: width - 80, height: 70,
      borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1
    });

    // Left Column
    page.drawText(`NAME: ${student.name.toUpperCase()}`, { x: 50, y: height - 110, size: 10, font: fontBold });
    page.drawText(`CLASS: ${className}`, { x: 50, y: height - 125, size: 10, font: fontReg });
    page.drawText(`ADM NO: ${student.admission_no}`, { x: 50, y: height - 140, size: 10, font: fontMono });

    // Right Column
    page.drawText(`EXAM: ${result.Exam.name.toUpperCase()}`, { x: 300, y: height - 110, size: 10, font: fontBold });
    page.drawText(`DATE: ${result.Exam.start_date.toLocaleDateString()}`, { x: 300, y: height - 125, size: 10, font: fontReg });
    page.drawText(`RESULT ID: ${result.id.slice(0, 8).toUpperCase()}`, { x: 300, y: height - 140, size: 10, font: fontMono });


    // --- MARKS TABLE ---
    const tableTop = height - 220;

    // Table Header
    page.drawRectangle({ x: 40, y: tableTop, width: width - 80, height: 25, color: rgb(0.9, 0.9, 0.9) });
    page.drawText("SUBJECT", { x: 50, y: tableTop + 8, size: 10, font: fontBold });
    page.drawText("MARKS", { x: 300, y: tableTop + 8, size: 10, font: fontBold });
    page.drawText("GRADE", { x: 450, y: tableTop + 8, size: 10, font: fontBold });

    // Table Rows
    let yPos = tableTop - 25;
    result.marks.forEach((mark) => {
      page.drawText(mark.subject.name, { x: 50, y: yPos + 8, size: 10, font: fontReg });
      page.drawText(`${mark.marks_obtained} / ${mark.max_marks}`, { x: 300, y: yPos + 8, size: 10, font: fontReg });
      page.drawText(mark.grade, { x: 450, y: yPos + 8, size: 10, font: fontBold });

      // Line
      page.drawLine({ start: { x: 40, y: yPos }, end: { x: width - 40, y: yPos }, color: rgb(0.9, 0.9, 0.9), thickness: 1 });
      yPos -= 25;
    });

    // --- SUMMARY ---
    yPos -= 20;
    page.drawText(`TOTAL PERCENTAGE: ${result.total_percentage}%`, {
      x: 300, y: yPos, size: 14, font: fontBold, color: rgb(0, 0, 0)
    });

    yPos -= 20;
    page.drawText(`REMARKS: ${result.remarks || 'Excellent performance.'}`, {
      x: 50, y: yPos, size: 10, font: fontReg, color: rgb(0.3, 0.3, 0.3)
    });

    // --- FOOTER ---
    page.drawText('This is a computer generated document. No signature required.', {
      x: 50, y: 50, size: 8, font: fontReg, color: rgb(0.6, 0.6, 0.6)
    });
    page.drawText(`Generated on ${new Date().toLocaleString()}`, {
      x: width - 200, y: 50, size: 8, font: fontReg, color: rgb(0.6, 0.6, 0.6)
    });

    // Serialize
    const pdfBytes = await pdfDoc.save();
    return `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;

  } catch (e) {
    console.error("PDF Gen Error:", e);
    return "";
  }
}
