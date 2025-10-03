exports.up = async function(knex) {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.string('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').nullable(); // Nullable for Google OAuth users
    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table.boolean('email_verified').defaultTo(false);
    table.string('google_id').nullable().unique();
    table.timestamps(true, true);
  });

  // Email verification codes table
  await knex.schema.createTable('email_verification_codes', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('code', 6).notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamps(true, true);
  });

  // Password reset tokens table
  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('token').unique().notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamps(true, true);
  });

  // Notes table
  await knex.schema.createTable('notes', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('content').defaultTo('');
    table.enum('storage_type', ['local', 'cloud']).defaultTo('cloud');
    table.boolean('deleted').defaultTo(false);
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);
    
    table.index(['user_id', 'deleted']);
    table.index(['user_id', 'updated_at']);
  });

  // Sync queue for offline changes
  await knex.schema.createTable('sync_queue', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('note_id').nullable(); // Nullable for user-level operations
    table.enum('operation', ['create', 'update', 'delete']).notNullable();
    table.json('data').nullable(); // Operation-specific data
    table.timestamp('queued_at').defaultTo(knex.fn.now());
    table.boolean('processed').defaultTo(false);
    table.timestamp('processed_at').nullable();
    
    table.index(['user_id', 'processed']);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('sync_queue');
  await knex.schema.dropTableIfExists('notes');
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('email_verification_codes');
  await knex.schema.dropTableIfExists('users');
};