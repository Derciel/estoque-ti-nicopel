exports.up = function(knex) {
  return knex.schema.table('produtos', function(table) {
    table.string('imagem_url'); // Adiciona a nova coluna para o URL da imagem
  });
};

exports.down = function(knex) {
  return knex.schema.table('produtos', function(table) {
    table.dropColumn('imagem_url');
  });
};