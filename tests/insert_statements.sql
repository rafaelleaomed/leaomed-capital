
      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-20_1', '6ca6298c-0421-5392-b47f-4b096aced3c5', -10.83, '2026-09-20', '2026-09-20',
        'Google One', 'Serviços de Assinaturas', 'Streaming & Assinaturas', false, false, '56027c67c2a158f7110302f713326cfa3cbe25392accbf2140726823281eb187'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-11-28_2', '6ca6298c-0421-5392-b47f-4b096aced3c5', -15.41, '2026-11-28', '2026-11-28',
        'MERCADOLIVRE M 11/12', 'Compras', 'Compras Online', true, false, '09b01c7466f0439c3501ef6eb87da544677386da010f6ccd6c149537b8ccc195'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-02-26_3', '6ca6298c-0421-5392-b47f-4b096aced3c5', -274.66, '2026-02-26', '2026-02-26',
        'SEMPRE DE SAMS 08/21', 'Casa', 'Supermercado', true, false, '05885beb0acb88d1f5101b0703134e64397b9eb3f4ed5c6816dcbd3af550ff0e'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-04-25_4', '6ca6298c-0421-5392-b47f-4b096aced3c5', -6837.22, '2026-04-25', '2026-04-25',
        'LOCALIZA SN VC 06/12', 'Transporte', 'Parcela T-Cross Cartão', true, false, '2a73696a07067ddcf556738b70ed8b4490b7224f4c0100fae800ac5b8a511c7e'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-03_5', '6ca6298c-0421-5392-b47f-4b096aced3c5', -24.99, '2026-09-03', '2026-09-03',
        'Google One', 'Serviços de Assinaturas', 'Streaming & Assinaturas', false, false, '70d9207ee15ba818dc2a28f6de185a6802b6929695c38ce06bd10e32c0069ef1'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-05_6', '6ca6298c-0421-5392-b47f-4b096aced3c5', -118.6, '2026-09-05', '2026-09-05',
        'Burger King App', 'Alimentação', 'Restaurantes & Fast Food', false, false, '900b71ce40f806019f483849f3105b650645c3286dc3d27b97ea2d48522c48ba'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-05_7', '6ca6298c-0421-5392-b47f-4b096aced3c5', -3458, '2026-09-05', '2026-09-05',
        'HTM D2IA CONSULTORIA E', 'Outros', 'Geral', false, false, 'c8583c905549ebb217a112d21f2881026370f72ef52fbfa336ac037db4a084bb'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-05_8', '6ca6298c-0421-5392-b47f-4b096aced3c5', -79.9, '2026-09-05', '2026-09-05',
        'MERCADINHO BABY', 'Compras', 'Vestuário & Acessórios', false, false, '3ece982091ff4a55835739f4420528202360c3686498903ec43116d046ee637f'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-06_9', '6ca6298c-0421-5392-b47f-4b096aced3c5', -71.8, '2026-09-06', '2026-09-06',
        'DONNA ANNA -CT', 'Alimentação', 'Restaurantes & Fast Food', false, false, 'ecb690bb859d1643b1698f36a533fbeede425afa51cb335343856930ea0ff049'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-06_10', '6ca6298c-0421-5392-b47f-4b096aced3c5', -112, '2026-09-06', '2026-09-06',
        'MEP Quintal 2025', 'Outros', 'Geral', false, false, '1350145f353b0e134b262ad738d7c65a6a86460830185f3391083e28ec3e4d29'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-06_11', '6ca6298c-0421-5392-b47f-4b096aced3c5', -40, '2026-09-06', '2026-09-06',
        'MEP Quintal 2025', 'Outros', 'Geral', false, false, 'b0cd40fbf5ae0a8f90cfd44c6ff5d99851e3ce22ad53f52cf4e85a2892b8e6f3'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-06_12', '6ca6298c-0421-5392-b47f-4b096aced3c5', -97.44, '2026-09-06', '2026-09-06',
        'MEP Quintal -CT', 'Outros', 'Geral', false, false, '7c2fd56b3ecd53b8b2d9d75bde4289bb7930354883256fe6e2055fb03c1c3f26'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-06_13', '6ca6298c-0421-5392-b47f-4b096aced3c5', -8.5, '2026-09-06', '2026-09-06',
        'Gelada Cia -CT', 'Casa', 'Supermercado', false, false, '9f1980abd3cfa8896fa17c68673619225ddc8dcf2edbd25524165e66d150d223'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-06_14', '6ca6298c-0421-5392-b47f-4b096aced3c5', -96.32, '2026-09-06', '2026-09-06',
        'MEP Quintal 2025', 'Outros', 'Geral', false, false, '46fd50b4ee2c6bfa239591ab790856d2c7f4c5fb34064b04371057e1048086e3'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-06_15', '6ca6298c-0421-5392-b47f-4b096aced3c5', -39.2, '2026-09-06', '2026-09-06',
        'MEP Quintal', 'Outros', 'Geral', false, false, '329a4a44fb8821e64e4e701c05c74e8583f645530543c88663c7f332d5c9404c'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-06_16', '6ca6298c-0421-5392-b47f-4b096aced3c5', -61.3, '2026-09-06', '2026-09-06',
        'Burger King App', 'Alimentação', 'Restaurantes & Fast Food', false, false, '98308b5f9d26a6108c32185a910b93e2c3ac170c1e767b3f7d9ce475bb9e5f0e'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-07_17', '6ca6298c-0421-5392-b47f-4b096aced3c5', -70.45, '2026-09-07', '2026-09-07',
        'PADARIA ARTE DO TRIGO', 'Casa', 'Supermercado', false, false, '3fda49a92596180d1e21d1e7f237ea0ca92d8ead106e099f9705a59836115538'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-07_18', '6ca6298c-0421-5392-b47f-4b096aced3c5', -13.95, '2026-09-07', '2026-09-07',
        'BAFF S COMERCIO DE PRO', 'Casa', 'Supermercado', false, false, '6986883f8c08377ab00f570e8159abe381eb760c9abdc5a752f447d28291b6c6'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-07_19', '6ca6298c-0421-5392-b47f-4b096aced3c5', -16.93, '2026-09-07', '2026-09-07',
        'DL UberRides', 'Transporte', 'Táxi/Uber', false, false, 'd574526ef243663dc91c1813bfd6faaf16a5e3d077fbc9ebddad15d97104e6c2'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-08_20', '6ca6298c-0421-5392-b47f-4b096aced3c5', -25, '2026-09-08', '2026-09-08',
        'LAPAZA ESTACIONAMENTO', 'Transporte', 'Estacionamentos', false, false, '3321088b6a0928e32f27c9e4b8653fea731026c255547f4ad12c29b8149a5093'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-08_21', '6ca6298c-0421-5392-b47f-4b096aced3c5', -119.89, '2026-09-08', '2026-09-08',
        'MLP Magalu-Netshoes', 'Compras', 'Compras & Presentes', false, false, '02868e3052a1b54c9aabe01af57b2d456258ee8785d18d5abe3402da81d01380'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-10_22', '6ca6298c-0421-5392-b47f-4b096aced3c5', -30.4, '2026-09-10', '2026-09-10',
        'RESTAURANTE VO MARIA L', 'Alimentação', 'Restaurantes & Fast Food', false, false, 'a5a5a269ab6b1a77653527430d857dfba396cb6e33af3e2520ba5e78d96c362a'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-10_23', '6ca6298c-0421-5392-b47f-4b096aced3c5', -65, '2026-09-10', '2026-09-10',
        'MadreTeresa -CT', 'Transporte', 'Estacionamentos', false, false, '9294c1866ca4318ff90e21aedfa7af8ff0556b2c8b590535c90d641e92f0b2ec'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-11_24', '6ca6298c-0421-5392-b47f-4b096aced3c5', -65, '2026-09-11', '2026-09-11',
        'MadreTeresa -CT', 'Transporte', 'Estacionamentos', false, false, 'b2250c6f97273d280a65ae1796dbbb4edfef46e906e23a072dbfd8842e5a844a'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-11_25', '6ca6298c-0421-5392-b47f-4b096aced3c5', -84, '2026-09-11', '2026-09-11',
        'MP LOTERIASONLINEQ6Q', 'Lazer & Estilo de Vida', 'Lazer & Viagens', false, false, '86285031d5744d52d3e15c2b04f65ddd8f5980e88c109ccb3a0cc076ff4285c1'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-11_26', '6ca6298c-0421-5392-b47f-4b096aced3c5', -400.26, '2026-09-11', '2026-09-11',
        'SUPERMERCADOS BH', 'Casa', 'Supermercado', false, false, '00f05fcf3275380f9f31ddc3a82968bf14b045d12e62ae4b53c8ce3ab61837f3'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-11_27', '6ca6298c-0421-5392-b47f-4b096aced3c5', -10.71, '2026-09-11', '2026-09-11',
        'BAFF S COMERCIO DE PRO', 'Casa', 'Supermercado', false, false, '5194cfa86977fc8f85158d68a617ca5fe361c93bdfad4c5e95802140b22da8b8'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-11_28', '6ca6298c-0421-5392-b47f-4b096aced3c5', -13.5, '2026-09-11', '2026-09-11',
        'BAFF S COMERCIO DE PRO', 'Casa', 'Supermercado', false, false, 'f676d707e72c53fe75a8e41c42209419aa0d5add87c23c9c30befdd42896c720'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-11_29', '6ca6298c-0421-5392-b47f-4b096aced3c5', -41.8, '2026-09-11', '2026-09-11',
        'ED MAIS BAR E RESTAURA', 'Alimentação', 'Restaurantes & Fast Food', false, false, '6a01eac930bd546f5e882c613ed5c7994e77f14ee9f146dc1fdc209c4cf0cc52'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-13_30', '6ca6298c-0421-5392-b47f-4b096aced3c5', -128.46, '2026-09-13', '2026-09-13',
        'SlopesGastrobar', 'Alimentação', 'Restaurantes & Fast Food', false, false, 'b66cd9c34b44a74bf8f674163301f5a02b78d74c7b3e0677c943ac238de82a47'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-13_31', '6ca6298c-0421-5392-b47f-4b096aced3c5', -99.67, '2026-09-13', '2026-09-13',
        'MP LOTERIASONLINELNL', 'Lazer & Estilo de Vida', 'Lazer & Viagens', false, false, '744a289fc08b604c8d2faefbd12b4f807bd4c70984dfea34cc60d39787c87ba8'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-14_32', '6ca6298c-0421-5392-b47f-4b096aced3c5', -65, '2026-09-14', '2026-09-14',
        'MadreTeresa -CT', 'Transporte', 'Estacionamentos', false, false, '90f2c41983d2d0bf2620b1139e408bd202ef9f6441325ae503fb60e965858042'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-14_33', '6ca6298c-0421-5392-b47f-4b096aced3c5', -16, '2026-09-14', '2026-09-14',
        'CAPPTA PANIFICADORA A', 'Casa', 'Supermercado', false, false, '37c02617459806c127692017d5894b5f7be193dd4e678a67c63b781e6bf2dbff'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-17_34', '6ca6298c-0421-5392-b47f-4b096aced3c5', -90, '2026-09-17', '2026-09-17',
        'CLIP BARBEARIA', 'Lazer & Estilo de Vida', 'Cuidados Pessoais', false, false, '189db189dd8fb49c3abfbdd49abf64e9765abf57dd6ccf1bc2b639a3bdabdc0d'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-17_35', '6ca6298c-0421-5392-b47f-4b096aced3c5', -78.54, '2026-09-17', '2026-09-17',
        'SUP EPA CENTO E VINTE', 'Casa', 'Supermercado', false, false, '9193595ce2757348b96b0fdaa2c5894d171659f8d766a2498203a00a1e00585f'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-19_36', '6ca6298c-0421-5392-b47f-4b096aced3c5', -187.88, '2026-09-19', '2026-09-19',
        'DISTRITO BUR-CT ENTR', 'Outros', 'Geral', false, false, 'cf82eb790e39ba470439aea01824212ceb5c204824a28ef76a8474cd87d2e625'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-19_37', '6ca6298c-0421-5392-b47f-4b096aced3c5', -360.94, '2026-09-19', '2026-09-19',
        'CLUBE SERRA -CT OEDA', 'Lazer & Estilo de Vida', 'Lazer & Viagens', false, false, '77e2beff806f00b101afde785a1d95c73c4f773a4848d91130eb39839d9c13e3'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-21_38', '6ca6298c-0421-5392-b47f-4b096aced3c5', -120, '2026-09-21', '2026-09-21',
        'HOSPITAL MAT-CT EI', 'Transporte', 'Estacionamentos', false, false, 'a857176dac623da4806c35c00a2c4f8762225ef9563d81ddbd5b5e4b0c843272'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-21_39', '6ca6298c-0421-5392-b47f-4b096aced3c5', -159.1, '2026-09-21', '2026-09-21',
        'PostoDe', 'Transporte', 'Combustível', false, false, 'f4d3a9d97be4ff06546807833bcd2ed80c03e4c942cbb71bb394669c9b083086'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-22_40', '6ca6298c-0421-5392-b47f-4b096aced3c5', -43, '2026-09-22', '2026-09-22',
        'HospitalBeti-CT', 'Transporte', 'Estacionamentos', false, false, 'f2c8c5ec00195f994b8602d2dbe31e7b7fd6004b4adfdc38f242ce678ea87f80'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-22_41', '6ca6298c-0421-5392-b47f-4b096aced3c5', -29, '2026-09-22', '2026-09-22',
        'MadreTeresa', 'Transporte', 'Estacionamentos', false, false, 'b5f52138a4102edabaf07b32a033c679eb0d9d32d469f3038f608eb3e8bfda76'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-22_42', '6ca6298c-0421-5392-b47f-4b096aced3c5', -31.87, '2026-09-22', '2026-09-22',
        'Araujo Loja', 'Saúde', 'Farmácia & Medicamentos', false, false, '1b23c31612453940a0d8d0cf6133a54242618fde257e0edc579d54fe13d30b71'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-22_43', '6ca6298c-0421-5392-b47f-4b096aced3c5', -95.98, '2026-09-22', '2026-09-22',
        'MUNDO VERDE', 'Casa', 'Supermercado', false, false, 'd28b77b62453ed7bc7b28ea7f82ab8b5248d1c1ee4263dc46caa32ab3aee290e'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-23_44', '6ca6298c-0421-5392-b47f-4b096aced3c5', -65, '2026-09-23', '2026-09-23',
        'MadreTeresa -CT', 'Transporte', 'Estacionamentos', false, false, '56613b2b710d7b5a7ee3f718055df0060b2ea2adababe0bb5876b6bfc3d1fe42'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-23_45', '6ca6298c-0421-5392-b47f-4b096aced3c5', -26.1, '2026-09-23', '2026-09-23',
        'BAFF S COMERCIO DE PRO', 'Casa', 'Supermercado', false, false, 'c5980f7bbd96b70152a02f1fadea78d31fc36aa8b112aafade29ccb3eb40f617'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-24_46', '6ca6298c-0421-5392-b47f-4b096aced3c5', -41.25, '2026-09-24', '2026-09-24',
        'JANUARIO COMERCIO DE A', 'Alimentação', 'Restaurantes & Fast Food', false, false, '6798bacd19f05e1f0cd6160a2673ef72808717a2b258181a26432a22ba6f241f'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-25_47', '6ca6298c-0421-5392-b47f-4b096aced3c5', -33.56, '2026-09-25', '2026-09-25',
        'PADARIA ARTE DO TRIGO', 'Casa', 'Supermercado', false, false, 'e65bf5b2b28cd93c1c3a05aa51fb69780915862346107f7c015d38459e90296d'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-25_48', '6ca6298c-0421-5392-b47f-4b096aced3c5', -313.64, '2026-09-25', '2026-09-25',
        'ARIGATO CULINARIA JAPO', 'Alimentação', 'Restaurantes & Fast Food', false, false, '524493a75e91dc922d68fc2147e8017421f17a4b48befe9ef1344461555931d7'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-26_49', '6ca6298c-0421-5392-b47f-4b096aced3c5', -227.3, '2026-09-26', '2026-09-26',
        'BebedouroArtOf', 'Alimentação', 'Restaurantes & Fast Food', false, false, 'af5abad12e205d4c98421f21c8c02dc3ddfbb5358accfa5d61f1ee1ac40a9e24'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-26_50', '6ca6298c-0421-5392-b47f-4b096aced3c5', -16, '2026-09-26', '2026-09-26',
        'REDE ATLAS P-CT', 'Outros', 'Geral', false, false, 'a464c3d33e63f5220c7e4c457d0de379a9f683013aab41483aeadfc0e8f22e8e'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-27_51', '6ca6298c-0421-5392-b47f-4b096aced3c5', -70.59, '2026-09-27', '2026-09-27',
        'SPEEDPA BOTEQUIM BURITB', 'Outros', 'Geral', false, false, 'df7c9ac9a2c87c4b9c53aeb6ec5cf605c6d9ca39110ee2ad3c05a10ea833c354'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-28_52', '6ca6298c-0421-5392-b47f-4b096aced3c5', -41.8, '2026-09-28', '2026-09-28',
        'SUBWAY PRADOBelo Horizo', 'Alimentação', 'Restaurantes & Fast Food', false, false, 'c8a7075bb1774bc79170a6b0b55d60d76b14f53b8beb2a172139d1b293cc0ea3'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-28_53', '6ca6298c-0421-5392-b47f-4b096aced3c5', -64, '2026-09-28', '2026-09-28',
        'SoaresRestauranteBELO H', 'Alimentação', 'Restaurantes & Fast Food', false, false, 'd7ca663a7864cb7bb55e86fd396592f60280b6a731b88117aa5ad2712168fb77'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-29_54', '6ca6298c-0421-5392-b47f-4b096aced3c5', -59.98, '2026-09-29', '2026-09-29',
        'LOJAS REDESBELO HORIZON', 'Compras', 'Compras & Presentes', false, false, 'a64c2e5a2fc11fc4a2f80da55cc18774324c7c11f47cae3bff6167261fd4e5c0'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-29_55', '6ca6298c-0421-5392-b47f-4b096aced3c5', -47.84, '2026-09-29', '2026-09-29',
        'NATURA ATN - FRQ - 030B', 'Compras', 'Compras & Presentes', false, false, '3b690e989fff87128d4d3c2fdc6d03081937dfb81a6a3bda354667581bd8256b'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-10-02_56', '6ca6298c-0421-5392-b47f-4b096aced3c5', -274.24, '2026-10-02', '2026-10-02',
        'SN XUABELO HORIZONTBRA', 'Casa', 'Supermercado', false, false, '81e7e7ec5a5efb71ed1b5cf4237cd269cbc7f5636be62405b77f200fe8531846'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-10-02_57', '6ca6298c-0421-5392-b47f-4b096aced3c5', -205.17, '2026-10-02', '2026-10-02',
        'POSTO PONTEIO LTDABELO', 'Transporte', 'Combustível', false, false, 'b87be863d112eda56f4ca1375e6bc4d4c75ecb64c59e981a20e3a32fc27d470e'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-11_58', '6ca6298c-0421-5392-b47f-4b096aced3c5', -105.98, '2026-09-11', '2026-09-11',
        'OPENAI CHATGPT SUBSCR', 'Serviços de Assinaturas', 'Inteligência Artificial', false, false, 'a8395f1d655520717e2a3bb00ea2b1430417b78cb3b84bc83988fd84ff2ee873'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-09-30_59', '6ca6298c-0421-5392-b47f-4b096aced3c5', -55.4, '2026-09-30', '2026-09-30',
        'TYPESAFE AI, INC.SAN FR', 'Serviços de Assinaturas', 'Inteligência Artificial', false, false, 'a65d43c27cdac2aee363e493f18ce4c658043a37bc4cb39b0e361094a018f945'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    

      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '54d97c2c-c722-46bc-8f82-409c12593eef', 'itau_inv_2026-10-04_60', '6ca6298c-0421-5392-b47f-4b096aced3c5', -5.67, '2026-10-04', '2026-10-04',
        'Repasse de IOF', 'Impostos e Taxas PF', 'IOF', false, false, '95c4861d3bf0a89fd03188d69fa563b7081c2d2de81a4f3d7be23941b3a0b798'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    