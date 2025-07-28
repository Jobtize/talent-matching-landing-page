// Script para debugar variáveis de ambiente
console.log('🔍 Verificando variáveis de ambiente do banco de dados...\n');

const requiredVars = [
  'AZURE_SQL_SERVER',
  'AZURE_SQL_DATABASE', 
  'AZURE_SQL_USERNAME',
  'AZURE_SQL_PASSWORD'
];

const missingVars = [];
const presentVars = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    missingVars.push(varName);
  } else {
    presentVars.push({
      name: varName,
      value: varName.includes('PASSWORD') ? '[REDACTED]' : value
    });
  }
});

console.log('✅ Variáveis presentes:');
presentVars.forEach(({ name, value }) => {
  console.log(`  ${name}: ${value}`);
});

if (missingVars.length > 0) {
  console.log('\n❌ Variáveis ausentes:');
  missingVars.forEach(varName => {
    console.log(`  ${varName}: MISSING`);
  });
} else {
  console.log('\n🎉 Todas as variáveis de ambiente estão configuradas!');
}

console.log('\n📋 Resumo:');
console.log(`  Total de variáveis: ${requiredVars.length}`);
console.log(`  Presentes: ${presentVars.length}`);
console.log(`  Ausentes: ${missingVars.length}`);

if (missingVars.length > 0) {
  console.log('\n🚨 AÇÃO NECESSÁRIA:');
  console.log('Configure as variáveis ausentes no arquivo .env ou nas configurações do ambiente.');
  process.exit(1);
}
