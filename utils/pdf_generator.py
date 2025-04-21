"""
pdf_generator.py

Handles PDF generation for medical reports using ReportLab.
Creates professional-looking PDF documents with report data, charts, and formatting.
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime

from models import MedicalReport

def create_header(canvas, doc):
    """Add header to each page"""
    canvas.saveState()
    canvas.setFont('Helvetica-Bold', 16)
    canvas.drawString(inch, 10.5 * inch, "Medical Report")
    
    # Add date and page number
    canvas.setFont('Helvetica', 9)
    canvas.drawString(inch, 10.25 * inch, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    canvas.drawString(7 * inch, 10.25 * inch, f"Page {doc.page}")
    
    canvas.restoreState()

def generate_pdf_report(report: MedicalReport) -> bytes:
    """
    Generate a PDF report from a MedicalReport instance
    Returns the PDF as bytes
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=1.5 * inch,
        bottomMargin=inch
    )

    # Get styles
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    heading_style = styles['Heading2']
    normal_style = styles['Normal']

    # Create custom style for diagnosis
    diagnosis_style = ParagraphStyle(
        'DiagnosisStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=20
    )

    # Build document content
    content = []

    # Title
    content.append(Paragraph(report.title, title_style))
    content.append(Spacer(1, 20))

    # Report Information
    info_data = [
        ['Report ID:', str(report.id)],
        ['Created:', report.created_at.strftime('%Y-%m-%d %H:%M:%S')],
        ['Last Updated:', report.updated_at.strftime('%Y-%m-%d %H:%M:%S')],
    ]
    
    info_table = Table(
        info_data,
        colWidths=[2*inch, 4*inch],
        style=TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#2c3e50')),
        ])
    )
    content.append(info_table)
    content.append(Spacer(1, 20))

    # Diagnosis Section
    if report.diagnosis:
        content.append(Paragraph("Diagnosis", heading_style))
        content.append(Spacer(1, 10))
        content.append(Paragraph(report.diagnosis, diagnosis_style))
        content.append(Spacer(1, 20))

    # Report Data Section
    content.append(Paragraph("Report Details", heading_style))
    content.append(Spacer(1, 10))
    
    # Split report data into paragraphs for better readability
    for paragraph in report.report_data.split('\n'):
        if paragraph.strip():
            content.append(Paragraph(paragraph, normal_style))
            content.append(Spacer(1, 10))

    # Build PDF
    doc.build(
        content,
        onFirstPage=create_header,
        onLaterPages=create_header
    )

    # Get PDF content
    pdf_content = buffer.getvalue()
    buffer.close()

    return pdf_content