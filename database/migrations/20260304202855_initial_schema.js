exports.up = function (knex) {
    return knex.schema
        .createTable('usuarios', table => {
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.string('matricula').unique().notNullable();
        })
        .createTable('produtos', table => {
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.string('marca');
            table.text('descricao');
            table.string('imagem_url');
        })
        .createTable('equipamentos', table => {
            table.increments('id').primary();
            table.string('codigo_produto').unique().notNullable();
            table.string('numero_serie');
            table.integer('produto_id').unsigned().references('id').inTable('produtos');
            table.integer('usuario_id').unsigned().references('id').inTable('usuarios').nullable();
            table.string('status').defaultTo('Em Estoque');
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTable('equipamentos')
        .dropTable('produtos')
        .dropTable('usuarios');
};
