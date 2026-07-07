# SINC Web

Front-end do **SINC**, um app de organização financeira para casais: lançamentos com divisão de gastos, categorias, cartões, metas, gastos fixos recorrentes e um dashboard com "quem deve quanto a quem".

Consome a API do repositório [`sinc-api`](https://github.com/claralivia/sinc-api).

## Stack

- [Vue 3](https://vuejs.org/) (`<script setup>`) + TypeScript + [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/) para estado de autenticação
- [Vue Router](https://router.vuejs.org/)
- [Supabase](https://supabase.com/) (cliente JS) para login
- [Axios](https://axios-http.com/) para consumir a API, com o token do Supabase anexado automaticamente
- [ApexCharts](https://apexcharts.com/) (via `vue3-apexcharts`) para os gráficos do dashboard

## Telas

- **Login / Redefinir senha** — autenticação por e-mail e senha via Supabase.
- **Início (Dashboard)** — saldo do mês, receitas x despesas, quanto cada pessoa do vínculo está devendo, gráfico de receitas x despesas e gastos por categoria.
- **Transações** — histórico com busca por período, cada item em acordeão (expande pra mostrar descrição completa, forma de pagamento, cartão e divisão) com opções de editar e excluir; e uma aba de parcelamentos em aberto.
- **Novo lançamento / Editar lançamento** — mesmo formulário nos dois casos; permite preencher por IA (frase em linguagem natural), categoria, forma de pagamento, cartão, parcelas e divisão de gastos com o parceiro.
- **Metas** — metas de economia com aportes/retiradas, e gastos fixos recorrentes (criar, editar, lançar o mês).
- **Admin** (só para `role: ADMIN`) — categorias, cartões, papel de cada usuário, em nome de quem uma conta ADMIN cadastra (`managedUserId`) e vínculo de casal (`household`).

## Pré-requisitos

- **Node.js 20.19+ ou 22.12+** (exigência do Vite 8 — versões mais antigas não conseguem nem rodar `npm run dev`/`build`)
- A [API do SINC](https://github.com/claralivia/sinc-api) rodando (local ou remota)
- Um projeto Supabase (o mesmo usado pela API)

## Configuração

```bash
npm install
cp .env.example .env   # preencha com suas credenciais
npm run dev
```

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | sim | Chave anônima do Supabase |
| `VITE_API_URL` | não (padrão `http://localhost:3333/api`) | URL base da API do SINC |

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento do Vite |
| `npm run build` | Type-check (`vue-tsc`) + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |

## Estrutura

```
src/
├── main.ts               # bootstrap (Vue + Pinia + Router)
├── App.vue
├── router/index.ts        # rotas e guarda de autenticação/admin
├── stores/auth.ts         # sessão do Supabase + perfil (/me) via Pinia
├── lib/
│   ├── supabase.ts        # client do Supabase
│   └── api.ts             # client Axios (injeta o token em cada request)
├── layouts/AppLayout.vue  # shell com a navegação inferior
├── components/ui/         # botão, input, card e filtro de período reutilizáveis
└── pages/                 # uma tela por arquivo (Dashboard, Transactions, NewTransaction, Goals, Admin, Login, ResetPassword)
```
