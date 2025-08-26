import { Command } from 'commander';
import { createSeederCommands } from '@/cli/commands/seeder';
import { createMigrationCommands } from './commands/migration';

const program = new Command();

program.name('app-cli').description('Application CLI tools').version('1.0.0');

// Add migration commands
program.addCommand(createMigrationCommands());

// Register the new seeder command
program.addCommand(createSeederCommands());

// Parse command line arguments
program.parse();
