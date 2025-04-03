#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { exec } from 'child_process';
const workingDir = path.resolve(
  path.dirname(
    process.platform === 'win32'
      ? new URL(import.meta.url).pathname.substring(1) // Remove leading slash on Windows
      : new URL(import.meta.url).pathname
  )
);

console.log(workingDir)

// Utility function to log messages
const log = {
  success: (message) => console.log(chalk.green(message)),
  error: (message) => console.error(chalk.red(message)),
  info: (message) => console.log(chalk.blue(message)),
  code: (message) => console.log(chalk.grey(message)),
};

// Print ASCII art logo
const printLogo = () => {
  log.success(figlet.textSync('CRA NEXT!', { horizontalLayout: 'full' }));
};


const checkPaths = (projectPath) => {
  console.log(path.join(workingDir, 'template'));
  console.log(projectPath);
};

// Check if the project already exists
const checkProjectExists = (projectPath) => {
  if (fs.existsSync(projectPath)) {
    log.error(`A project with the name "${path.basename(projectPath)}" already exists.`);
    return true;
  }
  return false;
};

// Copy files from the template folder
const copyTemplateFiles = (templatePath, projectPath) => {
  const files = fs.readdirSync(templatePath);
  files.forEach((file) => {
    const src = path.join(templatePath, file);
    const dest = path.join(projectPath, file);

    if (fs.statSync(src).isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyTemplateFiles(src, dest); // Recursively copy subdirectories
    } else {
      fs.copyFileSync(src, dest);
    }
  });
};

// Create directory structure and copy template files
const createDirectories = (projectPath) => {
  const templatePath = path.join(workingDir, 'template'); // Path to the template folder

  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'src'));
  fs.mkdirSync(path.join(projectPath, 'public'));

  if (fs.existsSync(templatePath)) {
    copyTemplateFiles(templatePath, projectPath);
  } else {
    log.error('Template folder not found.' + templatePath);
  }
};

// Write JSON files
const writeJsonFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Write initial files
const writeInitialFiles = (projectPath, projectName) => {
//   fs.writeFileSync(
//     path.join(projectPath, 'src', 'main.tsx'),
//     `
// import React from 'react';
// import ReactDOM from 'react-dom/client';

// const App = () => {
//   return <div>Hello, World!</div>;
// };

// const rootElement = document.getElementById('root') as HTMLElement;
// ReactDOM.createRoot(rootElement).render(<App />);
//     `
//   );

  fs.writeFileSync(
    path.join(projectPath, 'public', 'index.html'),
    `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
    `
  );
};

// Install dependencies
const installDependencies = (projectPath, projectName) => {
  log.info('Installing dependencies...');
  exec('npm install', { cwd: projectPath }, (err, stdout, stderr) => {
    if (err) {
      log.error(`Error installing dependencies: ${stderr}`);
    } else {
      log.success('Dependencies installed!');

      log.success(`Project "${projectName}" created successfully!`);
      log.code(`   cd "${projectName}"`);
      log.code(`   bun dev`);
    }
  });
};

// Main function to create the project
const createProject = async (projectName, useMaterialUI) => {
  const projectPath = path.join(process.cwd(), projectName);

  if (checkProjectExists(projectPath)) return;

  log.info(`Creating project "${projectName}"...`);
  createDirectories(projectPath);

  const packageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'vite',
      lint: "eslint .",
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      ...(useMaterialUI
        ? {
            '@mui/material': '^5.0.0',
            '@emotion/react': '^11.0.0',
            '@emotion/styled': '^11.0.0',
          }
        : {
            'tailwindcss': '^4.1.1',
            '@tailwindcss/vite': '^4.1.1',
          }),
    },
    devDependencies: {
      typescript: '~5.8.2',
      eslint: '^9.23.0',
      prettier: '^3.5.3',
      vite: '^6.2.4',
      '@vitejs/plugin-react': '^4.3.4',
      'typescript-eslint': '^8.29.0',
      'eslint-plugin-react-hooks': '^5.2.0',
      'eslint-plugin-react-refresh': '^0.4.19',
      '@types/react': '^19.0.12',
      '@types/react-dom': '^19.0.4',
      '@types/node': '^22.13.14',
      'cross-env': '^7.0.3',
    },
  };

  writeJsonFile(path.join(projectPath, 'package.json'), packageJson);

  const tsconfig = {
    compilerOptions: {
      target: 'esnext',
      module: 'esnext',
      moduleResolution: 'node',
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['src/**/*.ts', 'src/**/*.tsx'],
  };

  writeJsonFile(path.join(projectPath, 'tsconfig.json'), tsconfig);

  const eslintConfig = {
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      jsx: true,
    },
    plugins: ['react', '@typescript-eslint', 'prettier'],
    rules: {
      'prettier/prettier': ['error'],
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
    },
    env: {
      browser: true,
      es2021: true,
    },
  };

  writeJsonFile(path.join(projectPath, '.eslintrc.json'), eslintConfig);

  const prettierConfig = {
    singleQuote: true,
    semi: false,
    trailingComma: 'all',
  };

  writeJsonFile(path.join(projectPath, '.prettierrc'), prettierConfig);

  writeInitialFiles(projectPath, projectName);
  installDependencies(projectPath, projectName);
};

// Prompt user for input
const promptUser = () => {
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the project name:',
      validate(input) {
        return input ? true : 'Project name cannot be empty';
      },
    },
    {
      type: 'list',
      name: 'useUI',
      message: 'Choose a UI library:',
      choices: ['Material-UI', 'Tailwind'],
      default: 'Material-UI',
    },
  ];

  inquirer.prompt(questions).then((answers) => {
    const { projectName, useUI } = answers;

    // Parse command line arguments
    const args = process.argv.slice(2);
    const debugMode = args.includes('--debug');

    // Call function to print paths if --debug is provided
    if (debugMode) checkPaths(projectName);

    createProject(projectName, useUI === 'Material-UI');
  });
};

// Run the CLI
printLogo();
promptUser();