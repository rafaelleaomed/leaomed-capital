import csv
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def parse_original_spreadsheet(file_path):
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = list(csv.reader(f))

    months = ['dez_25', 'jan_26', 'fev_26', 'mar_26', 'abr_26', 'mai_26', 'jun_26', 'jul_26', 'ago_26', 'set_26', 'out_26', 'nov_26', 'dez_26']
    
    # Índices dos meses nas colunas (coluna 1 = dez, 2 = jan, 3 = fev...)
    # Vamos estruturar os dados mês a mês
    monthly_data = {m: {
        'pj': {'gross': 0.0, 'taxes': 0.0, 'accounting': 0.0, 'prolabore': 0.0, 'leftover': 0.0},
        'pf': {'income': 0.0, 'expenses': 0.0, 'obligatory': 0.0, 'non_obligatory': 0.0, 'categories': {}},
        'investments': {'total_allocated': 0.0, 'current_balance': 0.0}
    } for m in months}

    def safe_float(val):
        try:
            val_clean = val.replace(',', '.').strip()
            return float(val_clean)
        except:
            return 0.0

    current_section = None
    current_category = None

    for row in reader:
        if not row or not any(row):
            continue
        first_col = row[0].strip()

        # Identificadores de seções
        if 'RENDA TOTAL' in first_col and current_section is None:
            current_section = 'PJ_REVENUE'
            continue
        elif 'Empresa - Despesas Fixas' in first_col:
            current_section = 'PJ_EXPENSES'
            continue
        elif 'Retirada Pró-labore' in first_col:
            for idx, m in enumerate(months):
                col_idx = idx + 1
                if col_idx < len(row):
                    monthly_data[m]['pj']['prolabore'] = safe_float(row[col_idx])
            continue
        elif 'Sobra do mês' in first_col and current_section == 'PJ_EXPENSES':
            for idx, m in enumerate(months):
                col_idx = idx + 1
                if col_idx < len(row):
                    monthly_data[m]['pj']['leftover'] = safe_float(row[col_idx])
            continue
        elif 'Orçamento' in first_col and current_section == 'PJ_EXPENSES':
            current_section = 'PF_BUDGET'
            continue

        # Processamento das linhas
        if current_section == 'PJ_REVENUE':
            if 'Camarinha BRUTO' in first_col:
                for idx, m in enumerate(months):
                    col_idx = idx + 1
                    if col_idx < len(row):
                        monthly_data[m]['pj']['gross'] = safe_float(row[col_idx])

        elif current_section == 'PJ_EXPENSES':
            if first_col in ['IRPJ', 'CSLL', 'COFINS', 'PIS', 'INSS', 'ISS', 'DARF', 'Outras taxas']:
                for idx, m in enumerate(months):
                    col_idx = idx + 1
                    if col_idx < len(row):
                        monthly_data[m]['pj']['taxes'] += safe_float(row[col_idx])
            elif 'Mensalidade Contabilidade' in first_col:
                for idx, m in enumerate(months):
                    col_idx = idx + 1
                    if col_idx < len(row):
                        monthly_data[m]['pj']['accounting'] = safe_float(row[col_idx])

        elif current_section == 'PF_BUDGET':
            if 'RENDA TOTAL' in first_col:
                for idx, m in enumerate(months):
                    col_idx = idx + 1
                    if col_idx < len(row):
                        monthly_data[m]['pf']['income'] = safe_float(row[col_idx])
            elif 'DESPESAS TOTAIS' in first_col:
                for idx, m in enumerate(months):
                    col_idx = idx + 1
                    if col_idx < len(row):
                        monthly_data[m]['pf']['expenses'] = safe_float(row[col_idx])
            elif first_col in ['Alimentação', 'Casa', 'Pets', 'Saúde', 'Financiamento', 'Impostos e taxas', 
                               'Transporte', 'Educação', 'Serviços Financeiros', 'Serviços de assinaturas', 
                               'Compras', 'Lazer', 'Restaurantes', 'Viagem']:
                current_category = first_col
                for idx, m in enumerate(months):
                    col_idx = idx + 1
                    if col_idx < len(row):
                        val = safe_float(row[col_idx])
                        if val > 0:
                            monthly_data[m]['pf']['categories'][current_category] = val

            elif 'Saldo Total dos Investimentos' in first_col:
                for idx, m in enumerate(months):
                    col_idx = idx + 1
                    if col_idx < len(row):
                        monthly_data[m]['investments']['current_balance'] = safe_float(row[col_idx])

    os.makedirs('.tmp', exist_ok=True)
    out_path = '.tmp/historical_summary.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(monthly_data, f, ensure_ascii=False, indent=2)

    print(f"✅ Histórico da planilha processado com sucesso! Salvo em {out_path}")
    return monthly_data

if __name__ == '__main__':
    parse_original_spreadsheet('database/dados_planilha_original.csv')
