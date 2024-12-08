# 🩺 **Sistema de Controle de Doadores (Node.js + Prisma)** 💾

Este projeto implementa um sistema de gerenciamento de doadores, famílias, doações e transações financeiras com rotas seguras utilizando **Node.js**, **Express**, **Prisma**, e autenticação por permissões. O sistema é projetado para fornecer operações CRUD e operações seguras para dados relacionados a doadores e suas doações.

---

## **Observacoes**

-- Somente o modulo de doadores foi enviado para o GIT por motivos de seguranca, caso tenha interesse em mais partes do codigo por favor entrar em contato

## 🚀 **Visão Geral do Projeto**

Este projeto tem o objetivo de:

- Gerenciar dados de **doadores**, **famílias**, **doações** e **transações PIX**.
- Oferecer uma API RESTful com rotas seguras por meio de autenticação baseada em **permissões de roles**.
- Utilizar **Prisma ORM** para gerenciar interações com o banco de dados.
- Documentar automaticamente as rotas por meio do **Swagger**.

---

## 🛠️ **Estrutura do Projeto**

O sistema é composto pelos seguintes componentes:

```
/doadores-system
│
├── /controllers          # Contém a lógica central de cada operação.
│   ├── index.js         # Funções para controle de operações CRUD.
│
├── /routes              # Rotas principais com acesso seguro.
│   └── index.js
│
├── /middlewares         # Lógica para verificar permissões e autorizações.
│   └── verify-permissions.middleware.js
│
├── /prisma              # Configuração para interações com o banco de dados Prisma.
│   └── schema.prisma
│
├── /docs                # Documentação Swagger.
│   └── swagger.json
│
├── server.js            # Configuração principal para inicializar o Express.
│
├── package.json         # Gerenciamento de pacotes npm.
│
└── README.md            # Documentação do projeto.
```

---

## ⚙️ **Configuração**

### Pré-requisitos
Certifique-se de ter o seguinte instalado em sua máquina:

1. **Node.js**: [Instale o Node.js aqui](https://nodejs.org/).
2. **Prisma ORM**: Configure-o com o banco de dados que deseja usar.

---

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-repositorio.git
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o banco de dados com Prisma:

```bash
npx prisma migrate dev
```

4. Inicie o servidor com:

```bash
npm run dev
```

Agora a aplicação estará no ar. Você pode acessar as rotas e a documentação Swagger automaticamente em `http://localhost:3000/docs`.


## 📂 **Estrutura de Dados**

Os dados do sistema estão organizados em 4 tabelas principais:

- **Donors**: Contém informações de todos os doadores.
- **Families**: Contém dados sobre as famílias dos doadores.
- **Donations**: Registro de doações feitas.
- **Pix Donations**: Transações financeiras do tipo PIX.
- **Items Donations**: Informações detalhadas sobre os itens envolvidos em doações.

---

Agora você está pronto para usar, testar e contribuir com o **Sistema de Controle de Doadores!** ✨🖥️