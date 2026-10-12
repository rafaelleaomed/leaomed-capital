# Recuperação e persistência de parcelamentos

O cache legado `leaomed_installment_store_v2` não contém proprietário. Por isso continua fora das leituras normais. A recuperação usa `/api/installments/recovery`: primeiro verifica a identidade autenticada no servidor e a configuração de proprietário `JEV_PLATFORM_OWNER_EMAIL` e, quando presente, `JEV_PLATFORM_OWNER_USER_ID`. A interface também exige que o marcador de e-mail anterior corresponda ao e-mail autenticado devolvido pelo servidor. Nenhum conteúdo financeiro legado é devolvido pelo GET.

O POST rejeita outras contas antes de acessar o banco e ignora qualquer `user_id` enviado no corpo. Cada registro recebe um UUID estável derivado do ID autenticado e do ID legado. Uma repetição não duplica registros; a recuperação não reativa registros excluídos. O cache original permanece intacto mesmo após sucesso. Sem cache ou marcador compatível, não há atribuição automática: a restauração exige um backup privado cuja propriedade tenha sido validada separadamente.

A tela usa o UUID devolvido pelo banco para novos registros e só altera o cache após confirmação do servidor. Uma consulta vazia remove registros antigos de banco do cache; descobertas locais ainda não salvas (`inst_`) permanecem disponíveis. Datas válidas são fornecidas mesmo quando o formulário não informa datas; o mês final usa `Mês/Ano`, formato esperado pelo motor de projeção. Falhas de salvar/excluir são exibidas e não são tratadas como sucesso.

A importação manual de um JSON selecionado explicitamente usa `/api/installments/import`, exige confirmação de propriedade do arquivo e `expectedUserId` correspondente à sessão atual. Essa operação cria somente registros da própria conta, com IDs derivados no servidor, e nunca consulta arquivos locais do servidor ou caches globais. A confirmação registra a declaração do usuário; não comprova a propriedade do arquivo. O bloqueio de proprietário da recuperação automática permanece separado e intacto.

`contractNotes`, `isPerpetual` e `entityType` são preservados apenas no cache com proprietário da sessão, pois a tabela atual não contém essas colunas. `database/07_installment_metadata.sql` prepara as colunas de forma aditiva; não foi executada. Persistência desses campos em outros dispositivos requer aplicar a migração e estender o contrato API antes de declarar suporte completo.

Validação sintética: `node tests/installment_recovery.test.cjs`, `node tests/api_user_isolation.test.cjs`, `npx tsc --noEmit`. Nenhuma migração ou escrita em banco real faz parte desses testes.
