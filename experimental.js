#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { exec } from 'child_process';

// Utility function to log messages
const log = {
  success: (message) => console.log(chalk.green(message)),
  error: (message) => console.error(chalk.red(message)),
  info: (message) => console.log(chalk.blue(message)),
};

// Print ASCII art logo
const printLogo = () => {
  log.success(figlet.textSync('My Vite CLI', { horizontalLayout: 'full' }));
};




// Check if the project already exists
const checkProjectExists = (projectPath) => {
  if (fs.existsSync(projectPath)) {
    log.error(`Проект с именем "${path.basename(projectPath)}" уже существует.`);
    return true;
  }
  return false;
};

// Create directory structure
const createDirectories = (projectPath) => {
  fs.mkdirSync(projectPath);
  fs.mkdirSync(path.join(projectPath, 'src'));
  fs.mkdirSync(path.join(projectPath, 'public'));
};

// Write JSON files
const writeJsonFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Write initial files
const writeInitialFiles = (projectPath, projectName) => {
  fs.writeFileSync(
    path.join(projectPath, 'src', 'main.tsx'),
    `
import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
  return <div>Hello, World!</div>;
};

const rootElement = document.getElementById('root') as HTMLElement;
ReactDOM.createRoot(rootElement).render(<App />);
    `
  );

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


const addTailwindCSS = (projectPath) =>{
    // Добавляем Tailwind конфигурацию и файлы стилей, если нужно
    if (!useMaterialUI) {
      // Создаем tailwind.config.js
      const tailwindConfig = {
        content: [
          './index.html',
          './src/**/*.{js,ts,jsx,tsx}',
        ],
        theme: {
          extend: {},
        },
        plugins: [],
      };
      // fs.writeFileSync(path.join(projectPath, 'tailwind.config.js'), JSON.stringify(tailwindConfig, null, 2));
  
      // Создаем postcss.config.js
      // const postcssConfig = {
      //   plugins: {
      //     tailwindcss: {},
      //     autoprefixer: {},
      //   },
      // };
      // fs.writeFileSync(path.join(projectPath, 'postcss.config.js'), JSON.stringify(postcssConfig, null, 2));
  
      // Добавляем стиль для tailwind в src/style.css
      const tailwindCss = `@tailwind base;\n@tailwind components;\n@tailwind utilities;`;
      fs.writeFileSync(path.join(projectPath, 'src', 'style.css'), tailwindCss);
    }};


// Install dependencies
const installDependencies = (projectPath) => {
  if (!useMaterialUI) {
    log.info('Установка зависимостей...');
    exec('npm install', { cwd: projectPath }, (err, stdout, stderr) => {
      if (err) {
        log.error(`Ошибка при установке зависимостей: ${stderr}`);
      } else {
        log.success('Зависимости успешно установлены!');
      }
    });
  }
};

const addShadCn = (projectPath)=>{
  //npx shadcn@latest init
  if (!useMaterialUI) {
    log.info('ShadCn initialization...');
    exec('npx shadcn@latest init', { cwd: projectPath }, (err, stdout, stderr) => {
      if (err) {
        log.error(`Error: ${stderr}`);
      } else {
        log.success('Initialized');
      }
    });
  }
}



// Main function to create the project
const createProject = async (projectName, useMaterialUI) => {
  const projectPath = path.join(process.cwd(), projectName);

  if (checkProjectExists(projectPath)) return;

  log.info(`Создание проекта "${projectName}"...`);
  createDirectories(projectPath);

  const packageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    scripts: {
      start: 'vite',
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
            // '@shadcn/ui': '^0.0.5',
            'tailwindcss' : '^4.1.1',
            '@tailwindcss/vite' : '^4.1.1',
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
  installDependencies(projectPath);
  addTailwindCSS(projectPath);
  addShadCn(projectPath);

  log.success(`Проект "${projectName}" успешно создан!`);
};

// Prompt user for input
const promptUser = () => {
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'Введите название проекта:',
      validate(input) {
        return input ? true : 'Название проекта не может быть пустым';
      },
    },
    {
      type: 'list',
      name: 'useUI',
      message: 'Выберите UI-библиотеку:',
      choices: ['Material-UI', 'Shadcn'],
      default: 'Material-UI',
    },
  ];

  inquirer.prompt(questions).then((answers) => {
    const { projectName, useUI } = answers;
    createProject(projectName, useUI === 'Material-UI');
  });
};

// Run the CLI
printLogo();
promptUser();