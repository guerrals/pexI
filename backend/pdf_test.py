import os
from reportlab.lib.pagesizes import landscape, letter
from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from schemas import Quadro
from typing import List

def gerar_pdf_com_layout_final():
    """
    Gera um PDF com layout e dados fixos, corrigindo os problemas de alinhamento,
    espaçamento, cores e quebra de texto para espelhar fielmente o anexo.
    """
    nome_ficheiro = "mapa_de_transporte_layout.pdf"
    
    # --- Configuração do Documento ---
    # Usamos margens menores para maximizar o espaço horizontal
    doc = SimpleDocTemplate(nome_ficheiro, pagesize=landscape(letter),
                            leftMargin=0.25*inch, rightMargin=0.25*inch,
                            topMargin=0.25*inch, bottomMargin=0.25*inch)
    
    story = []
    

    if True:
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Rodape', fontName='Helvetica', fontSize=10, leading=12))
        styles.add(ParagraphStyle(name='HeaderInfo', fontName="Helvetica", fontSize=12, leading=11))
        styles.add(ParagraphStyle(
            name='HeaderMain', 
            fontName="Helvetica-Bold", 
            fontSize=10,
            leading=12,
            textColor=colors.white,
            alignment=TA_CENTER)
        )
        styles.add(ParagraphStyle(name='Recolhida', fontName="Helvetica", fontSize=9, leading=11))
        
        style_saida_hora = ParagraphStyle(
            name='SaidaHora', fontName='Helvetica-Bold', fontSize=18,
            textColor=colors.HexColor('#C00000'), alignment=TA_CENTER, leading=22
        )

        dados_titulo_aut = [[Paragraph(f"QUADRO AUTONOMO", style=ParagraphStyle(name='QuadroTitulo', fontName='Helvetica-Bold', textColor=colors.white, leftIndent=-15))]] # Corrigido para branco
        tabela_titulo_aut = Table(dados_titulo_aut, colWidths=[1.5*inch], rowHeights=[0.3*inch])
        tabela_titulo_aut.setStyle(TableStyle([('BACKGROUND', (0,0), (0,0), colors.HexColor('#C00000')), ('VALIGN', (0,0), (0,0), 'MIDDLE'), ('LEFTPADDING', (0,0), (0,0), 28),]))

        texto_saida_vazio = Paragraph("Saída:<br/><b>--:--</b>", style_saida_hora)
        dados_header_aut = [[
            Paragraph("CARRO PRÓPRIO", styles['HeaderMain']),
            Paragraph("<b>Placa:</b><br/>N/A", styles['HeaderInfo']),
            Paragraph("<b>Modelo:</b><br/>N/A", styles['HeaderInfo']),
            texto_saida_vazio,
            Paragraph("<b>Endereço Base:</b><br/>N/A", styles['HeaderInfo'])
        ]]
        tabela_header_aut = Table(dados_header_aut, colWidths=[2.3*inch, 1.5*inch, 1.5*inch, 1.4*inch, 3.3*inch], rowHeights=[0.6*inch])
        tabela_header_aut.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BACKGROUND', (3,0), (3,0), colors.HexColor('#F2F2F2')), ('BACKGROUND', (0,0), (0,0), colors.black), ('VALIGN', (3,0), (3,0), 'MIDDLE'), ('GRID', (0,0), (-1,-1), 0.5, colors.black), ('LEFTPADDING', (0,0), (-1,-1), 6), ('RIGHTPADDING', (0,0), (-1,-1), 6), ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),]))
        
        # if destino_geral_autonomos:
        #      link_destino_aut = gerar_link_google_maps(destino_geral_autonomos)
        #      destino_paragraph_aut = Paragraph(f"<b>{destino_geral_autonomos.rua}</b><br/><font size='8'><a href={link_destino_aut}><font color='#0000EE'>{destino_geral_autonomos}</font></a></font>", styles['Recolhida'])
        # else:
        #      destino_paragraph_aut = Paragraph("DESTINO N/A", styles['Recolhida'])

        dados_recolha_aut = [["Hr de Saída", "Nome", "Recolhida", "Contato", "Destino"]]
        for p_aut in [0, 1, 2]:
             dados_recolha_aut.append([
                 "--:--", 
                 Paragraph(f"({p_aut}) {p_aut}", styles['CelulaWrapLeft']),
                 Paragraph("CARRO PRÓPRIO", styles['CelulaTexto']),
                 Paragraph(p_aut.contato, styles['CelulaTexto']),
             ])
        tabela_recolha_aut = Table(dados_recolha_aut, colWidths=[1.2*inch, 1.8*inch, 2.9*inch, 1.5*inch, 2.6*inch], repeatRows=1)
        tabela_recolha_aut.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), colors.HexColor('#b7b7b7')), ('TEXTCOLOR', (0,0), (-1,0), colors.black), ('FONTNAME', (0,0), (-1,0), 'Helvetica-BoldOblique'), ('ALIGN', (0,0), (-1,0), 'CENTER'), ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F2F2F2')), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('ALIGN', (0,1), (0,-1), 'CENTER'), ('GRID', (0,0), (-1,-1), 0.5, colors.black), ('TEXTCOLOR', (0,1), (0,-1), colors.grey), ('FONTSIZE', (0,1), (0,-1), 14), ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'), ('ALIGN', (2,1), (4,-1), 'CENTER'), ('LEFTPADDING', (1,1), (1,-1), 6)]))

        # 4. Rodapé (Simplificado)
        rodape1_aut_str = "<b>Previsão de Chegada no Destino:</b> --:-- | <b>Tempo de Trajeto:</b> -- | <b>Distância:</b> --"
        rodape2_aut_str = "<b>Fim de set:</b> 23:00 | <b>Link da Rota Completa:</b> N/A"
        
        moldura_data_aut = [[tabela_titulo_aut], [tabela_header_aut], [tabela_recolha_aut], [Paragraph(rodape1_aut_str, styles['Rodape'])], [Paragraph(rodape2_aut_str, styles['Rodape'])]]
        tabela_moldura_aut = Table(moldura_data_aut, colWidths=[10*inch])
        tabela_moldura_aut.setStyle(TableStyle([('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0), ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0)]))
        story.append(tabela_moldura_aut)

    # Constrói o PDF
    doc.build(story)
    print(f"PDF '{nome_ficheiro}' gerado com sucesso!")

# --- Ponto de Entrada do Script ---
if __name__ == "__main__":
    gerar_pdf_com_layout_final()