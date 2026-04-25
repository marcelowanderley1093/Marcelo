# Guia de Configuração do EmailJS — Primetax Holding Familiar

## O que é o EmailJS?

O **EmailJS** é um serviço que permite enviar e-mails diretamente do frontend (sem backend) usando templates. É gratuito para até **200 e-mails/mês**.

---

## Passo a Passo

### 1. Criar conta no EmailJS

Acesse: [https://www.emailjs.com](https://www.emailjs.com) e crie uma conta gratuita.

### 2. Adicionar um serviço de e-mail

1. No painel, vá em **Email Services** → **Add New Service**
2. Escolha **Gmail** (ou outro provedor)
3. Conecte sua conta `contato@primetax.com.br`
4. Anote o **Service ID** (ex: `service_primetax`)

### 3. Criar um template de e-mail

1. Vá em **Email Templates** → **Create New Template**
2. Configure o template assim:

**Subject:** Novo Questionário Holding Familiar — {{titular_nome}}

**Body:**
```
Novo questionário recebido!

Titular: {{titular_nome}}
CPF: {{titular_cpf}}
E-mail: {{titular_email}}
Data: {{data_preenchimento}}
Responsável: {{responsavel}}

Resumo:
- Herdeiros: {{num_herdeiros}}
- Imóveis: {{num_imoveis}}
- Empresas: {{num_empresas}}

Acesse o sistema para visualizar o PDF completo.
```

3. Anote o **Template ID** (ex: `template_holding`)

### 4. Obter a Public Key

1. Vá em **Account** → **General**
2. Copie a **Public Key** (ex: `abc123XYZ`)

### 5. Atualizar o App.tsx

No arquivo `App.tsx`, localize estas linhas e substitua pelos seus valores:

```typescript
const EMAILJS_SERVICE_ID = 'service_primetax';   // ← seu Service ID
const EMAILJS_TEMPLATE_ID = 'template_holding';   // ← seu Template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';      // ← sua Public Key
```

### 6. Fazer novo deploy

Após atualizar, rode:
```bash
npm run build
netlify deploy --dir=dist --prod
```

---

## Variáveis disponíveis no template

| Variável | Descrição |
|---|---|
| `{{titular_nome}}` | Nome completo do titular |
| `{{titular_cpf}}` | CPF do titular |
| `{{titular_email}}` | E-mail do titular |
| `{{data_preenchimento}}` | Data de preenchimento |
| `{{responsavel}}` | Responsável pelo preenchimento |
| `{{num_herdeiros}}` | Quantidade de herdeiros |
| `{{num_imoveis}}` | Quantidade de imóveis |
| `{{num_empresas}}` | Quantidade de empresas |

---

## Sobre o Deploy no Netlify

O site está publicado em: **http://bejewelled-travesseiro-a94f6d.netlify.app**

> ⚠️ **Importante:** O deploy anônimo expira em 60 minutos. Para ter um domínio permanente:
> 1. Acesse: https://app.netlify.com/drop/bejewelled-travesseiro-a94f6d
> 2. Crie uma conta gratuita no Netlify
> 3. Reivindique o site com o token fornecido
> 4. Você pode conectar um domínio próprio (ex: `questionario.primetax.com.br`)

---

## Para fazer novos deploys após mudanças

```bash
cd /home/ubuntu/Marcelo
npm run build
netlify deploy --dir=dist --prod
```

---

*Primetax Solutions — Documento Interno*
