exports.up = function(knex) {
  return knex.schema
    // 1. Cria a nova tabela 'produtos'
    .createTable('produtos', table => {
      table.increments('id').primary();
      table.string('nome').notNullable().unique();
      table.string('marca');
      table.text('descricao');
    })
    // 2. Cria a tabela 'usuarios' (se já não existisse)
    .createTable('usuarios', table => {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.string('matricula').unique();
    })
    // 3. Cria a tabela 'equipamentos' com a nova estrutura
    .createTable('equipamentos', table => {
      table.increments('id').primary();
      table.string('codigo_produto').notNullable().unique();
      table.string('numero_serie').unique();
      table.enum('status', ['Em Estoque', 'Em Uso', 'Manutenção']).defaultTo('Em Estoque');
      
      // Chaves estrangeiras (links para outras tabelas)
      table.integer('produto_id').unsigned().references('id').inTable('produtos').onDelete('CASCADE');
      table.integer('usuario_id').unsigned().references('id').inTable('usuarios').onDelete('SET NULL');
    });
};

exports.down = function(knex) {
  // A ordem de 'drop' é a inversa da criação
  return knex.schema
    .dropTable('equipamentos')
    .dropTable('usuarios')
    .dropTable('produtos');
};