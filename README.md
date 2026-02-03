# @grayskull/database

Módulo de conexão com banco de dados e Prisma Client para o sistema Grayskull ERP.

## Instalação

```bash
npm install github:seu-usuario/grayskull-database
```

## Uso

```typescript
import { PrismaClient, prisma } from '@grayskull/database';

// Usando a instância singleton
const users = await prisma.user.findMany();

// Ou criando sua própria instância
const client = new PrismaClient();
```

## Configuração

Defina a variável de ambiente `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/grayskull_db?schema=public"
```

## Scripts

- `npm run db:generate` - Gera o Prisma Client
- `npm run db:migrate` - Executa migrations em desenvolvimento
- `npm run db:migrate:prod` - Executa migrations em produção
- `npm run db:studio` - Abre o Prisma Studio
- `npm run db:seed` - Executa o seed do banco

## Modelos Disponíveis

### Core
- `Company` - Empresas
- `Branch` - Filiais
- `User` - Usuários
- `Role` - Cargos/Funções
- `Permission` - Permissões

### HR (Recursos Humanos)
- `Employee` - Funcionários
- `Dependent` - Dependentes
- `EmployeeAddress` - Endereços
- `EmployeeDocument` - Documentos
- `BenefitType` - Tipos de benefícios
- `EmployeeBenefit` - Benefícios do funcionário
- `Vacation` - Férias
- `Payroll` - Folha de pagamento
