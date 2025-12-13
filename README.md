# 🎄 Amigo Secreto Colaborativo

Aplicação web para organizar **Amigo Secreto** de forma simples.
Várias pessoas podem participar de computadores diferentes, cadastrar-se e depois consultar quem elas tiraram usando um **segredo pessoal**. Tudo isso com um fluxo bem definido e uma interface temática de fim de ano. ✨

---

## 🌟 Funcionalidades

- 👥 **Cadastro de participantes** com nome e segredo.
- ✅ Validação de regras:
  - Mínimo de 4 participantes.
  - Quantidade **obrigatoriamente par**.
- 🎲 **Sorteio automático circular** (cada pessoa tira outra, sem repetições).
- 💾 Persistência dos dados em **PostgreSQL** (via Vercel Postgres/Neon).
- 🔐 **Consulta individual**:
  - Cada pessoa informa nome + segredo.
  - A aplicação mostra **apenas** quem ela tirou.
- 🔁 **Novo sorteio**:
  - Limpa a tabela de participantes no banco.
  - Sistema volta para a etapa de cadastro.
- 🧭 **Fluxo guiado por etapas** (breadcrumb):
  - `CADASTRO → SORTEIO → CONSULTA`
  - O usuário sabe sempre onde está e para onde pode ir.

---

## 🧱 Arquitetura & Tecnologias

- ⚛️ **Next.js (App Router)**
- 💚 **React** com `useState` para estado local
- 🎨 **Tailwind CSS** para estilização
- 🐘 **PostgreSQL** (Vercel Postgres / Neon)
- 🌐 APIs REST:
  - `POST /api/sorteio` – salva o sorteio no banco.
  - `GET /api/consultar` – retorna quem a pessoa tirou.
  - `POST /api/reset` – limpa a tabela para um novo sorteio.

---

## 🗂 Estrutura principal

- `app/page.js`  
  Componente principal de UI e fluxo:
  - Estado de **etapa** (`cadastro`, `sorteio`, `consulta`).
  - Gerenciamento de **participantes**, **mensagens** e **loading**.
  - Breadcrumb, formulários e botões.

- `app/api/sorteio/route.js`  
  - Recebe lista de participantes sorteados.
  - Valida quantidade par.
  - Faz `DELETE FROM participantes` e insere todos novamente.

- `app/api/consultar/route.js`  
  - Busca no banco por `nome` + `segredo`.
  - Retorna apenas o campo `sorteado`.

- `app/api/reset/route.js`  
  - Executa `DELETE FROM participantes`.
  - Utilizado pelo botão **Novo Sorteio**.

---

## 🌐 Configuração do Banco

Crie um arquivo `.env.local` na raiz do projeto:

```env
POSTGRES_URL="postgresql://usuario:senha@host/banco?sslmode=require"
```

Garanta que:

- A variável está com o nome correto (`POSTGRES_URL`).
- O arquivo está na **raiz** do projeto (`package.json`).
- O servidor de desenvolvimento seja reiniciado após alterações.

---

## 🚀 Como rodar o projeto

1. **Instalar dependências**

```bash
npm install
# ou
yarn
```

2. **Configurar variáveis de ambiente**

Crie `.env.local` com `POSTGRES_URL` apontando para seu banco.

3. **Rodar em desenvolvimento**

```bash
npm run dev
# ou
yarn dev
```

4. Acessar no navegador:

```text
http://localhost:3000
```

---

## 🧭 Fluxo de uso (UX)

1. **Cadastro**
   - Várias pessoas podem ir adicionando participantes (no mesmo dispositivo).
   - Cada participante informa um **nome** e um **segredo pessoal**.

2. **Sorteio**
   - Ao atingir o número desejado (mínimo 4 e par), alguém acessa a etapa **SORTEIO**.
   - O sistema embaralha os participantes, gera o par de amigo secreto e salva no banco.

3. **Consulta**
   - Em qualquer computador, a pessoa vai à etapa **CONSULTA**.
   - Digita **nome + segredo** e descobre **apenas** quem tirou, sem ver os demais.

4. **Novo sorteio**
   - O botão **NOVO SORTEIO** limpa a tabela no banco.
   - A aplicação volta para **CADASTRO**, pronta para um novo evento.
