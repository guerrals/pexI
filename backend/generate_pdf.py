from reportlab.lib.pagesizes import landscape, letter
from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from models import ParadaDB
from utils import gerar_link_google_maps
from schemas import MapaTransporte, Quadro
from typing import List
from utils import formatar_tempo

# --- Funções de Formatação (Utils) ---



def formatar_distancia(quilometros: float) -> str:
    """Formata quilómetros para uma string como '15,5 km'."""
    if not isinstance(quilometros, (int, float)) or quilometros < 0:
        return "--"
    return f"{quilometros:.1f} km".replace('.', ',')

# --- Função Principal de Geração de PDF ---

def gerar_pdf(db_mapa: MapaTransporte):
    """
    Gera um PDF com layout e dados fixos, corrigindo os problemas de alinhamento,
    espaçamento, cores e quebra de texto para espelhar fielmente o anexo.
    """
    nome_ficheiro = "mapa_de_transporte_layout.pdf"
    quadros = db_mapa.quadros
    # --- Configuração do Documento ---
    # Usamos margens menores para maximizar o espaço horizontal
    doc = SimpleDocTemplate(nome_ficheiro, pagesize=landscape(letter),
                            leftMargin=0.25*inch, rightMargin=0.25*inch,
                            topMargin=0.25*inch, bottomMargin=0.25*inch)

    story = []
    quadros_normais = []
    passageiros_autonomos = []
    destino_geral_autonomos = None
    for quadro in quadros:
        tem_autonomo = any(passageiro.autonomo for passageiro in quadro.passageiros)
        if not tem_autonomo and quadro.rota:
            quadros_normais.append(quadro)
            if not destino_geral_autonomos:
                destino_geral_autonomos = quadro.destino
        else:
            for passageiro in quadro.passageiros:
                if passageiro.autonomo:
                    passageiros_autonomos.append(passageiro)
            if not destino_geral_autonomos:
                destino_geral_autonomos = quadro.destino
    
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
    
    # NOVO ESTILO para as Regras
    style_regras = ParagraphStyle(name='Regras', fontName='Helvetica', fontSize=10, leading=12, spaceAfter=6)

    # --- 1. TÍTULO PRINCIPAL DO MAPA DE TRANSPORTE ---
    titulo_mapa = Paragraph(db_mapa.nome.upper(), styles['h1'])
    story.append(titulo_mapa)
    story.append(Spacer(1, 0.1*inch))
    
    data_inicio_str = db_mapa.data_inicio.strftime('%d/%m/%Y')
    story.append(Paragraph(f"Data: {data_inicio_str}", styles['h3']))
    story.append(Spacer(1, 0.2*inch))

    # --- 2. NOVA SECÇÃO: REGRAS ---
    if db_mapa.regras:
        story.append(Paragraph("<b>REGRAS GERAIS:</b>", style_regras))
        # Substitui quebras de linha por <br/> para o Paragraph
        regras_formatadas = db_mapa.regras.replace('\n', '<br/>')
        story.append(Paragraph(regras_formatadas, styles['Normal']))
        
        # Adiciona o espaçamento solicitado de 2 polegadas
        story.append(Spacer(1, 1*inch))

    for quadro in quadros_normais:
        # --- Estilos Personalizados ---
        style_saida_hora = ParagraphStyle(
            name='SaidaHora', fontName='Helvetica-Bold', fontSize=18,
            textColor=colors.HexColor('#C00000'), alignment=TA_CENTER, leading=22
        )

        # --- Estrutura de Layout ---
        # Vamos criar uma "tabela moldura" para conter tudo e garantir o alinhamento
        
        # 1. Título "QUADRO 01"
        dados_titulo = [[Paragraph(quadro.nome, style=ParagraphStyle(name='QuadroTitulo', fontName='Helvetica-Bold', textColor=colors.HexColor("#fcec0c"), leftIndent=-15))]]
        tabela_titulo = Table(dados_titulo, colWidths=[1.5*inch], rowHeights=[0.3*inch])
        tabela_titulo.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#C00000')),
            ('VALIGN', (0,0), (0,0), 'MIDDLE'), ('LEFTPADDING', (0,0), (0,0), 28),
        ]))

        # 2. Tabela de Cabeçalho (Informações do Veículo)
        texto_saida = Paragraph(f"Saída:<br/><b>{quadro.horario_saida.strftime('%H:%M') if quadro.horario_saida else '--:--'}</b>", style_saida_hora)
        dados_header = [[
            Paragraph(f"<br/><br/>", styles['HeaderMain']),
            Paragraph(f"<b>Placa:</b><br/>", styles['HeaderInfo']),
            Paragraph(f"<b>Modelo:</b><br/>", styles['HeaderInfo']),
            texto_saida,
            Paragraph(f"<b>Endereço:</b><br/>{quadro.origem}", styles['HeaderInfo'])
        ]]
        tabela_header = Table(dados_header, colWidths=[2.3*inch, 1.5*inch, 1.5*inch, 1.4*inch, 3.3*inch], rowHeights=[0.6*inch])
        tabela_header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BACKGROUND', (3,0), (3,0), colors.HexColor('#F2F2F2')),
            ('BACKGROUND', (0,0), (0,0), colors.black),
            ('VALIGN', (3,0), (3,0), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('LEFTPADDING', (0,0), (-1,-1), 6), ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        
        # 3. Tabela Principal de Recolha (Itinerário)
        link_destino = gerar_link_google_maps(quadro.destino)
        destino_paragraph = Paragraph(
            f"<b>{quadro.destino.rua}</b><br/><font size='8'><a href={link_destino}><font color='#0000EE'>{quadro.destino}</font></a></font>", 
            styles['Recolhida']
        )
        paradas_ordenadas: List[ParadaDB] = sorted(quadro.rota.paradas, key=lambda p: p.ordem)
        paradas_formatada = []
        for parada in paradas_ordenadas:
            paradas_formatada.append(
                [
                    parada.horario_saida.strftime("%H:%M") if parada.horario_saida else "--:--", 
                    f"({parada.passageiro.funcao.value[0]}) {parada.passageiro.nome}", 
                    Paragraph(f"{parada.endereco}", styles['Recolhida']), 
                    f"{parada.passageiro.contato}", 
                    destino_paragraph
                ]
            )
        dados_recolha = [
            ["Hr de Saída", "Nome", "Recolhida", "Contato", "Destino"],
            *paradas_formatada
        ]
        tabela_recolha = Table(dados_recolha, colWidths=[1.2*inch, 1.8*inch, 2.9*inch, 1.5*inch, 2.6*inch], repeatRows=1)
        tabela_recolha.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#b7b7b7')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-BoldOblique'), ('ALIGN', (0,0), (-1,0), 'CENTER'),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F2F2F2')), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (0,1), (0,-1), 'CENTER'), ('ALIGN', (1,1), (1,-1), 'LEFT'), ('LEFTPADDING', (1,1), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('TEXTCOLOR', (0,1), (0,-1), colors.HexColor('#C00000')),
            ('ALIGN', (2,1), (4,-1), 'CENTER'), 
            ('LEFTPADDING', (1,1), (1,-1), 6),
            ('FONTSIZE', (0,1), (0,-1), 14), ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ]))

        # 4. Rodapé
        # <b>Fim de set:</b> 23:00 | 
        rodape1_str = f"<b>Previsão de Chegada no Destino:</b> {quadro.rota.horario_chegada_estimado.strftime('%H:%M') if quadro.rota.horario_chegada_estimado else '--:--'} | <b>Tempo de Trajeto:</b> {formatar_tempo(quadro.rota.duracao_total_estimada)} | <b>Distância:</b> {formatar_distancia(quadro.rota.distancia_total_estimada_km)}"
        rodape2_str = f"<b>Link da Rota Completa:</b> <a href={quadro.rota.google_maps_link}><font color='#0000EE'><u>Abrir no Google Maps</u></font></a>"

        # --- Montagem da Tabela Moldura ---
        # Esta tabela principal organiza todos os elementos e força a largura total
        moldura_data = [
            [tabela_titulo],
            [tabela_header],
            [tabela_recolha],
            [Paragraph(rodape1_str, styles['Rodape'])],
            [Paragraph(rodape2_str, styles['Rodape'])]
        ]
        
        tabela_moldura = Table(moldura_data, colWidths=[10*inch]) # Largura total
        tabela_moldura.setStyle(TableStyle([
            # Remove todas as bordas e preenchimentos da moldura
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        
        story.append(tabela_moldura)

        story.append(Spacer(1, .7*inch))

    if passageiros_autonomos:
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
        
        if destino_geral_autonomos:
             link_destino_aut = gerar_link_google_maps(destino_geral_autonomos)
             destino_paragraph_aut = Paragraph(f"<b>{destino_geral_autonomos.rua}</b><br/><font size='8'><a href={link_destino_aut}><font color='#0000EE'>{destino_geral_autonomos}</font></a></font>", styles['Recolhida'])
        else:
             destino_paragraph_aut = Paragraph("DESTINO N/A", styles['Recolhida'])

        dados_recolha_aut = [["Hr de Saída", "Nome", "Recolhida", "Contato", "Destino"]]
        for p_aut in passageiros_autonomos:
             dados_recolha_aut.append([
                 "--:--", 
                 Paragraph(f"({p_aut.funcao.value[0]}) {p_aut.nome}", styles['CelulaWrapLeft']),
                 Paragraph("CARRO PRÓPRIO", styles['CelulaTexto']),
                 Paragraph(p_aut.contato, styles['CelulaTexto']),
                 destino_paragraph_aut
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

    return nome_ficheiro
