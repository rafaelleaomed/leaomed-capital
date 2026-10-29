<div align="center">

**Idioma:** [Português do Brasil](README.md) · [English](README.en.md)

# LeãoMed Capital

**Inteligência financeira para consolidar finanças pessoais e empresariais.**

[Demonstração com dados sintéticos](https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app/demo)

</div>

## O problema

Profissionais que recebem por diferentes fontes podem ter receitas, despesas, cartões, tributos e investimentos espalhados entre contas pessoais e empresariais. A fragmentação dificulta entender o caixa disponível, revisar lançamentos e planejar aportes.

O LeãoMed Capital centraliza esse fluxo em uma aplicação com separação PF/PJ, importação de documentos, categorização revisável e projeções financeiras. É uma ferramenta de organização e apoio à decisão, não consultoria financeira.

## O que está implementado

- dashboard consolidado, pessoal e empresarial;
- importação de faturas e extratos com OCR;
- revisão granular, edição e categorização em lote de transações;
- regras determinísticas e classificação semântica opcional com JEV;
- confirmação humana para categorias sensíveis e sugestões da IA;
- gestão de cartões, parcelamentos, orçamento e despesas fixas;
- acompanhamento de tributos e alíquota efetiva da pessoa jurídica;
- simuladores de teto diário, reserva de emergência e aportes;
- carteira de investimentos e apoio ao rebalanceamento;
- modo privacidade e demonstração isolada com dados sintéticos.

## Segurança e isolamento

As rotas autenticadas validam a sessão no servidor e vinculam operações ao usuário. O sistema usa consultas parametrizadas, cookies de autenticação gerenciados pelo Supabase e credenciais de IA protegidas no servidor. O modo de demonstração não exige acesso a dados reais.

A classificação por IA é assistiva: sem credencial válida, o sistema mantém as regras locais; com IA habilitada, resultados ambíguos continuam sujeitos à revisão humana.

## Arquitetura

- **Aplicação:** Next.js 16, React 19 e TypeScript;
- **Banco de dados:** Neon Serverless PostgreSQL;
- **Autenticação:** Supabase Auth com SSR;
- **IA:** TypeSafe AI / JEV, com regras determinísticas como primeira camada;
- **Documentos:** OCR e extração de dados de faturas e extratos;
- **Qualidade:** testes de isolamento, persistência e upload, além de validação TypeScript e build.

## Executar localmente

```bash
npm install
npm run dev
```

O ambiente local exige banco, autenticação e variáveis dos serviços opcionais. Não versione credenciais ou documentos financeiros.

## Verificação

```bash
npx tsc --noEmit
node tests/document_upload_runtime.test.cjs
npm run build
```

## Limitações atuais

- OCR e classificação podem exigir correção manual;
- a integração Open Finance está preparada na arquitetura, mas depende de credenciais de produção;
- projeções e simuladores dependem da qualidade dos dados inseridos;
- a demonstração usa dados sintéticos e não representa recomendação de investimento.

## Autor

**Rafael Leão, médico:** desenvolvimento de produtos digitais para problemas clínicos, operacionais e financeiros.
[GitHub](https://github.com/rafaelleaomed) · [LinkedIn](https://www.linkedin.com/in/rafaelleaomed/)
