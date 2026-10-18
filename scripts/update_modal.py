with open(r'c:\Users\racle\Meu Drive\Projeto IA\Projeto Plataforma Financeira\components\dashboard\AccountSettingsModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Limpar defaults
text = text.replace("useState('Dr. Usuário')", "useState('')")
text = text.replace("useState('usuario@leaomed.com')", "useState('')")
text = text.replace("useState('Cirurgião Geral / Médico')", "useState('')")
text = text.replace("useState('CRM-MG')", "useState('')")

# Integrar busca da API
old_load = """        const supabase = createSupabaseBrowserClient()
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          if (data.user.email) setEmail(data.user.email)
          if (data.user.user_metadata?.full_name) setFullName(data.user.user_metadata.full_name)
        }"""

new_load = """        const res = await fetch('/api/user/profile')
        const profileData = await res.json()
        if (profileData?.success && profileData?.profile) {
          if (profileData.profile.email) setEmail(profileData.profile.email)
          if (profileData.profile.name) setFullName(profileData.profile.name)
          if (profileData.profile.specialty) setSpecialty(profileData.profile.specialty)
          if (profileData.profile.crm) setCrm(profileData.profile.crm)
        } else {
          const supabase = createSupabaseBrowserClient()
          const { data } = await supabase.auth.getUser()
          if (data?.user) {
            if (data.user.email) setEmail(data.user.email)
            if (data.user.user_metadata?.full_name) setFullName(data.user.user_metadata.full_name)
          }
        }"""

text_crlf = text.replace('\r\n', '\n')
old_crlf = old_load.replace('\r\n', '\n')
new_crlf = new_load.replace('\r\n', '\n')

if old_crlf in text_crlf:
    text_crlf = text_crlf.replace(old_crlf, new_crlf, 1)
    print("loadUser atualizado com chamada para /api/user/profile")

with open(r'c:\Users\racle\Meu Drive\Projeto IA\Projeto Plataforma Financeira\components\dashboard\AccountSettingsModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text_crlf)

print("AccountSettingsModal modificado com sucesso!")
