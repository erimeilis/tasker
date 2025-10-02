import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm'

export class InitialSchema1730741750000 implements MigrationInterface {
  name = 'InitialSchema1730741750000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

    // Create tasks table
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in_progress', 'completed'],
            default: "'pending'",
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high'],
            default: "'medium'",
          },
          {
            name: 'dueDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    )

    // Create app_tags table
    await queryRunner.createTable(
      new Table({
        name: 'app_tags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '7',
            default: "'#3b82f6'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    )

    // Create tasks_tags_relation junction table
    await queryRunner.createTable(
      new Table({
        name: 'tasks_tags_relation',
        columns: [
          {
            name: 'task_id',
            type: 'uuid',
          },
          {
            name: 'tag_id',
            type: 'uuid',
          },
        ],
      }),
      true
    )

    // Add primary key to junction table
    await queryRunner.query(`
      ALTER TABLE "tasks_tags_relation"
        ADD CONSTRAINT "PK_tasks_tags_relation"
        PRIMARY KEY ("task_id", "tag_id")
    `)

    // Add foreign keys for junction table
    await queryRunner.createForeignKey(
      'tasks_tags_relation',
      new TableForeignKey({
        columnNames: ['task_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tasks',
        onDelete: 'CASCADE',
      })
    )

    await queryRunner.createForeignKey(
      'tasks_tags_relation',
      new TableForeignKey({
        columnNames: ['tag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'app_tags',
        onDelete: 'CASCADE',
      })
    )

    // Add indexes for tasks table
    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_tasks_status_priority',
        columnNames: ['status', 'priority'],
      })
    )

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_tasks_createdAt',
        columnNames: ['createdAt'],
      })
    )

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_tasks_dueDate',
        columnNames: ['dueDate'],
      })
    )

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_tasks_title',
        columnNames: ['title'],
      })
    )

    // Add indexes for junction table
    await queryRunner.createIndex(
      'tasks_tags_relation',
      new TableIndex({
        name: 'IDX_tasks_tags_task_id',
        columnNames: ['task_id'],
      })
    )

    await queryRunner.createIndex(
      'tasks_tags_relation',
      new TableIndex({
        name: 'IDX_tasks_tags_tag_id',
        columnNames: ['tag_id'],
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes for junction table
    await queryRunner.dropIndex('tasks_tags_relation', 'IDX_tasks_tags_tag_id')
    await queryRunner.dropIndex('tasks_tags_relation', 'IDX_tasks_tags_task_id')

    // Drop task indexes
    await queryRunner.dropIndex('tasks', 'IDX_tasks_title')
    await queryRunner.dropIndex('tasks', 'IDX_tasks_dueDate')
    await queryRunner.dropIndex('tasks', 'IDX_tasks_createdAt')
    await queryRunner.dropIndex('tasks', 'IDX_tasks_status_priority')

    // Drop tables (foreign keys will be dropped automatically with CASCADE)
    await queryRunner.dropTable('tasks_tags_relation')
    await queryRunner.dropTable('app_tags')
    await queryRunner.dropTable('tasks')
  }
}
