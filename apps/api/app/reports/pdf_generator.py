import os
import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_investigation_pdf(
    investigation_data: dict,
    transactions: list,
    evidence_items: list,
    risk_events: list,
    timeline_events: list,
    investigator_name: str = "Authorized Cybercrime Investigator"
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A')
    )
    
    subheader_style = ParagraphStyle(
        'DocSubHeader',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569')
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )

    disclaimer_style = ParagraphStyle(
        'LegalDisclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B')
    )

    story = []

    # Title & Header
    story.append(Paragraph("VASPTrace - Official Blockchain Intelligence Report", header_style))
    story.append(Paragraph("Automated VASP Attribution & On-Chain Asset Flow Documentation", subheader_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1E3A8A'), spaceBefore=2, spaceAfter=10))

    # 1. Case & Investigation Parameters Table
    inv = investigation_data
    case_table_data = [
        [
            Paragraph("<b>Case Identifier:</b>", body_style),
            Paragraph(f"{inv.get('case_number', 'N/A')}", body_style),
            Paragraph("<b>Investigation Date:</b>", body_style),
            Paragraph(f"{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", body_style)
        ],
        [
            Paragraph("<b>Case Name:</b>", body_style),
            Paragraph(f"{inv.get('case_name', 'N/A')}", body_style),
            Paragraph("<b>Investigator:</b>", body_style),
            Paragraph(f"{investigator_name}", body_style)
        ],
        [
            Paragraph("<b>Target Wallet:</b>", body_style),
            Paragraph(f"<code>{inv.get('wallet_address', 'N/A')}</code>", body_style),
            Paragraph("<b>Blockchain Network:</b>", body_style),
            Paragraph(f"{inv.get('blockchain', 'Ethereum').upper()}", body_style)
        ],
        [
            Paragraph("<b>Traversal Depth:</b>", body_style),
            Paragraph(f"{inv.get('max_hops', 3)} Maximum Hops", body_style),
            Paragraph("<b>Investigation Status:</b>", body_style),
            Paragraph(f"{inv.get('status', 'Completed').upper()}", body_style)
        ]
    ]

    t_case = Table(case_table_data, colWidths=[110, 160, 110, 150])
    t_case.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_case)
    story.append(Spacer(1, 12))

    # 2. Nearest VASP Attribution Finding (Primary Highlight)
    story.append(Paragraph("2. Nearest Identified VASP & Flow Attribution", section_heading))
    vasp_name = inv.get('nearest_vasp_name') or "No VASP Found"
    attr_status = inv.get('attribution_status', 'UNKNOWN')
    hops = inv.get('hop_distance', 'N/A')
    confidence = int((inv.get('attribution_confidence') or 0.0) * 100)

    attr_table_data = [
        [
            Paragraph("<b>Nearest Recognized VASP:</b>", body_style),
            Paragraph(f"<b>{vasp_name}</b>", body_style),
            Paragraph("<b>Attribution Status:</b>", body_style),
            Paragraph(f"<b>{attr_status}</b>", body_style)
        ],
        [
            Paragraph("<b>Distance from Target:</b>", body_style),
            Paragraph(f"{hops} Hop(s) from Suspect", body_style),
            Paragraph("<b>Direct Deposit:</b>", body_style),
            Paragraph("YES (Direct Flow)" if inv.get('direct_deposit') else "NO (Multi-hop Layered)", body_style)
        ],
        [
            Paragraph("<b>Attribution Confidence:</b>", body_style),
            Paragraph(f"{confidence}% Strength Signal", body_style),
            Paragraph("<b>Risk Categorization:</b>", body_style),
            Paragraph(f"<b>{inv.get('risk_level', 'LOW')}</b>", body_style)
        ]
    ]

    t_attr = Table(attr_table_data, colWidths=[130, 140, 120, 140])
    t_attr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#93C5FD')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#DBEAFE')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_attr)
    story.append(Spacer(1, 10))

    # 3. Supporting Evidence Records
    story.append(Paragraph("3. Preserved Supporting Evidence", section_heading))
    if evidence_items:
        ev_rows = [[
            Paragraph("<b>Evidence Type</b>", body_style),
            Paragraph("<b>Title & Verified Observation</b>", body_style),
            Paragraph("<b>Source Repository</b>", body_style),
            Paragraph("<b>Strength</b>", body_style)
        ]]
        for ev in evidence_items:
            ev_rows.append([
                Paragraph(str(ev.get('evidence_type', '')), body_style),
                Paragraph(f"<b>{ev.get('title', '')}</b><br/>{ev.get('description', '')}", body_style),
                Paragraph(str(ev.get('source', '')), body_style),
                Paragraph(str(ev.get('strength', 'HIGH')), body_style)
            ])
        t_ev = Table(ev_rows, colWidths=[90, 230, 150, 60])
        t_ev.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_ev)
    else:
        story.append(Paragraph("No verifiable evidence records catalogued for this wallet query.", body_style))

    story.append(Spacer(1, 10))

    # 4. Multi-hop Transaction Flow Summary
    story.append(Paragraph("4. Transaction Path & Multi-Hop Ledger Trail", section_heading))
    if transactions:
        tx_rows = [[
            Paragraph("<b>Hop</b>", body_style),
            Paragraph("<b>From Address</b>", body_style),
            Paragraph("<b>To Address</b>", body_style),
            Paragraph("<b>Amount</b>", body_style),
            Paragraph("<b>Tx Hash</b>", body_style)
        ]]
        for tx in transactions[:10]:  # Cap at 10 for clean report formatting
            from_a = f"{tx.get('from_address', '')[:6]}...{tx.get('from_address', '')[-4:]}"
            to_a = f"{tx.get('to_address', '')[:6]}...{tx.get('to_address', '')[-4:]}"
            tx_h = f"{tx.get('tx_hash', '')[:8]}..."
            tx_rows.append([
                Paragraph(str(tx.get('hop_level', 1)), body_style),
                Paragraph(from_a, body_style),
                Paragraph(to_a, body_style),
                Paragraph(f"{tx.get('amount', 0.0):.2f} {tx.get('asset', 'ETH')}", body_style),
                Paragraph(tx_h, body_style)
            ])
        t_tx = Table(tx_rows, colWidths=[35, 125, 125, 85, 160])
        t_tx.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('TOPPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_tx)
    story.append(Spacer(1, 10))

    # 5. Risk Indicators
    story.append(Paragraph("5. AML / Cybercrime Risk Indicators", section_heading))
    risk_reason = inv.get('risk_reason') or "Standard profile."
    story.append(Paragraph(f"<b>Overall Risk Assessment:</b> {inv.get('risk_level', 'LOW')} - {risk_reason}", body_style))
    story.append(Spacer(1, 6))

    # 6. Statutory Disclaimer & Limitations
    story.append(Paragraph("6. Limitations & Statutory Intelligence Disclaimer", section_heading))
    disclaimer_text = (
        "IMPORTANT NOTICE: Blockchain intelligence supports investigative analysis and does not by itself establish "
        "legal ownership or criminal liability. Attribution results indicate analytical correlations derived from "
        "graph topology and known intelligence clusters. All results must be independently reviewed and verified "
        "against official exchange KYC records, judicial warrants, and applicable legal processes (e.g. SAHYOG / CrPC). "
        "Probabilistic and heuristic matches must never be represented as conclusive legal proof of ownership."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    return buffer.getvalue()
