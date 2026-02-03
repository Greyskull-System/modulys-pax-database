import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco do cliente...\n');

  // ============================================================
  // 1. CRIAR EMPRESA
  // ============================================================
  console.log('🏢 Criando empresa...');
  
  const company = await prisma.company.upsert({
    where: { document: '12345678000199' },
    update: {},
    create: {
      name: 'TransLog Transportes',
      tradeName: 'TransLog',
      document: '12345678000199',
      email: 'contato@translog.com.br',
      phone: '(11) 99999-9999',
      address: 'Rua das Transportadoras, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
  });
  
  console.log(`   ✅ Empresa: ${company.name}`);

  // ============================================================
  // 2. CRIAR FILIAL MATRIZ
  // ============================================================
  console.log('\n🏪 Criando filial...');
  
  const branch = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'MATRIZ' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Matriz São Paulo',
      code: 'MATRIZ',
      city: 'São Paulo',
      state: 'SP',
    },
  });
  
  console.log(`   ✅ Filial: ${branch.name}`);

  // ============================================================
  // 3. CRIAR PERMISSÕES
  // ============================================================
  console.log('\n🔐 Criando permissões...');
  
  const permissions = [
    // Funcionários
    { code: 'employees.view', name: 'Ver funcionários', module: 'employees' },
    { code: 'employees.create', name: 'Criar funcionários', module: 'employees' },
    { code: 'employees.edit', name: 'Editar funcionários', module: 'employees' },
    { code: 'employees.delete', name: 'Excluir funcionários', module: 'employees' },
    { code: 'employees.manage_access', name: 'Gerenciar acesso ao sistema', module: 'employees' },
    
    // Perfis
    { code: 'roles.view', name: 'Ver perfis', module: 'roles' },
    { code: 'roles.manage', name: 'Gerenciar perfis', module: 'roles' },
    
    // Configurações
    { code: 'settings.view', name: 'Ver configurações', module: 'settings' },
    { code: 'settings.manage', name: 'Gerenciar configurações', module: 'settings' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    });
  }
  
  console.log(`   ✅ ${permissions.length} permissões criadas`);

  // ============================================================
  // 4. CRIAR PERFIL ADMIN
  // ============================================================
  console.log('\n👔 Criando perfil Administrador...');
  
  const allPermissions = await prisma.permission.findMany();
  
  // Remove perfil existente para recriar com permissões atualizadas
  await prisma.role.deleteMany({
    where: { companyId: company.id, name: 'Administrador' },
  });

  const adminRole = await prisma.role.create({
    data: {
      companyId: company.id,
      name: 'Administrador',
      description: 'Acesso total ao sistema',
    },
  });

  // Associa todas as permissões ao perfil
  for (const perm of allPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }
  
  console.log(`   ✅ Perfil: ${adminRole.name} (${allPermissions.length} permissões)`);

  // ============================================================
  // 5. CRIAR FUNCIONÁRIO ADMIN (com acesso ao sistema)
  // ============================================================
  console.log('\n👤 Criando funcionário admin...');
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminEmployee = await prisma.employee.upsert({
    where: { companyId_email: { companyId: company.id, email: 'admin@translog.com.br' } },
    update: {
      password: hashedPassword,
      hasSystemAccess: true,
      roleId: adminRole.id,
    },
    create: {
      companyId: company.id,
      branchId: branch.id,
      roleId: adminRole.id,
      name: 'Administrador',
      email: 'admin@translog.com.br',
      cpf: '12345678901',
      position: 'Gerente de TI',
      department: 'TI',
      hasSystemAccess: true,
      password: hashedPassword,
    },
  });
  
  console.log(`   ✅ Funcionário: ${adminEmployee.name} (${adminEmployee.email})`);

  // ============================================================
  // 6. CRIAR ALGUNS FUNCIONÁRIOS DE EXEMPLO (sem acesso ao sistema)
  // ============================================================
  console.log('\n👥 Criando funcionários de exemplo...');
  
  const employees = [
    { name: 'João Silva', email: 'joao@translog.com.br', cpf: '11122233344', position: 'Motorista', department: 'Operações' },
    { name: 'Maria Santos', email: 'maria@translog.com.br', cpf: '22233344455', position: 'Analista RH', department: 'RH' },
    { name: 'Carlos Oliveira', email: 'carlos@translog.com.br', cpf: '33344455566', position: 'Coordenador', department: 'Logística' },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { companyId_email: { companyId: company.id, email: emp.email } },
      update: emp,
      create: {
        ...emp,
        companyId: company.id,
        branchId: branch.id,
        hasSystemAccess: false, // Sem acesso ao sistema
      },
    });
    console.log(`   ✅ ${emp.name} (sem acesso ao sistema)`);
  }

  // ============================================================
  // RESUMO
  // ============================================================
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('✅ SEED CONCLUÍDO!');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('\n📋 Credenciais do Admin:');
  console.log('   Email: admin@translog.com.br');
  console.log('   Senha: admin123');
  console.log('\n🏢 Empresa: TransLog Transportes');
  console.log('🏪 Filial: Matriz São Paulo');
  console.log(`👥 Funcionários: 4 (1 com acesso, 3 sem acesso)`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
