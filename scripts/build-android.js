const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'android-build');
const cordovaDir = path.join(buildDir, 'cordova-app');

// Set Android SDK path
process.env.ANDROID_HOME = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || 'C:\\Users\\ALBASGHA\\AppData\\Local\\Android\\Sdk';
process.env.ANDROID_SDK_ROOT = process.env.ANDROID_HOME;

// Ensure required directories exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Function to execute commands and display output
function runCommand(command, cwd = rootDir) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command execution failed: ${command}`);
    console.error(error);
    return false;
  }
}

// Check for Android build requirements
function checkRequirements() {
  console.log('Checking requirements...');
  
  try {
    // Check for Node.js
    const nodeVersion = execSync('node --version').toString().trim();
    console.log(`Node.js: ${nodeVersion}`);
    
    // Check for npm
    const npmVersion = execSync('npm --version').toString().trim();
    console.log(`npm: ${npmVersion}`);
    
    // Check for Android SDK
    const androidHome = process.env.ANDROID_HOME;
    if (!androidHome || !fs.existsSync(androidHome)) {
      console.error(`Android SDK not found at path: ${androidHome}`);
      console.error('Please make sure Android Studio is installed and the path is correct.');
      return false;
    }
    console.log(`Android SDK: ${androidHome}`);
    
    return true;
  } catch (error) {
    console.error('Failed to check requirements:', error);
    return false;
  }
}

// Build the web app
function buildWebApp() {
  console.log('Building web application...');
  return runCommand('npm run build -- --no-lint');
}

// Function to update Cordova config.xml
function updateCordovaConfig() {
  console.log('Updating Cordova configuration...');
  const configPath = path.join(cordovaDir, 'config.xml');
  
  if (!fs.existsSync(configPath)) {
    console.error('config.xml not found');
    return false;
  }
  
  try {
    // Read the config file
    let configXml = fs.readFileSync(configPath, 'utf8');
    
    // Update name, description, and author
    configXml = configXml.replace(/<name>.*?<\/name>/g, '<name>CodeLingo</name>');
    configXml = configXml.replace(/<description>.*?<\/description>/g, '<description>Learn programming languages easily with CodeLingo</description>');
    configXml = configXml.replace(/<author.*?>.*?<\/author>/g, '<author email="info@codelingo.app" href="https://codelingo.app">CodeLingo Team</author>');
    
    // Add language support
    if (!configXml.includes('<preference name="DefaultLanguage"')) {
      const preferenceTag = '<preference name="DefaultLanguage" value="en-US" />';
      configXml = configXml.replace('</widget>', `    ${preferenceTag}\n</widget>`);
    }
    
    // Write the updated config
    fs.writeFileSync(configPath, configXml);
    console.log('Config.xml updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update config.xml:', error);
    return false;
  }
}

// Build Android app using Cordova
function buildAndroidApp() {
  console.log('Building Android application...');
  
  // Create Cordova project if it doesn't exist
  if (!fs.existsSync(cordovaDir)) {
    console.log('Creating Cordova project...');
    
    // Install Cordova if not already installed
    if (!runCommand('npm list -g cordova || npm install -g cordova')) {
      console.error('Failed to install Cordova');
      return false;
    }
    
    // Create Cordova project
    if (!runCommand(`cordova create "${cordovaDir}" com.codelingo.app CodeLingo`)) {
      console.error('Failed to create Cordova project');
      return false;
    }
    
    // Add Android platform
    if (!runCommand(`cordova platform add android`, cordovaDir)) {
      console.error('Failed to add Android platform');
      return false;
    }
  }
  
  // Copy build files to Cordova www directory
  console.log('Copying build files to Cordova project...');
  const outDir = path.join(rootDir, 'out');
  const wwwDir = path.join(cordovaDir, 'www');
  
  // Check if out directory exists
  if (!fs.existsSync(outDir)) {
    console.error('Build output directory not found. Make sure the build was successful.');
    return false;
  }
  
  // Clear www directory and copy files
  if (fs.existsSync(wwwDir)) {
    fs.rmSync(wwwDir, { recursive: true, force: true });
  }
  fs.mkdirSync(wwwDir, { recursive: true });
  
  // Copy files
  console.log('Copying application files to Cordova project...');
  fs.cpSync(outDir, wwwDir, { recursive: true });
  
  // Update config.xml
  if (!updateCordovaConfig()) {
    console.error('Failed to update Cordova configuration');
    return false;
  }
  
  // Add essential Cordova plugins
  console.log('Adding Cordova plugins...');
  runCommand('cordova plugin add cordova-plugin-splashscreen', cordovaDir);
  runCommand('cordova plugin add cordova-plugin-statusbar', cordovaDir);
  runCommand('cordova plugin add cordova-plugin-whitelist', cordovaDir);
  runCommand('cordova plugin add cordova-plugin-inappbrowser', cordovaDir);
  runCommand('cordova plugin add cordova-plugin-network-information', cordovaDir);
  
  // Build Android app
  console.log('Building Android application using Cordova...');
  if (!runCommand('cordova build android --release', cordovaDir)) {
    console.error('Failed to build Android application');
    return false;
  }
  
  // Copy APK file to build directory
  const apkPath = path.join(cordovaDir, 'platforms', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk');
  const targetPath = path.join(buildDir, 'codelingo.apk');
  
  if (fs.existsSync(apkPath)) {
    fs.copyFileSync(apkPath, targetPath);
    console.log(`APK file copied to: ${targetPath}`);
    return true;
  } else {
    console.error('APK file not found');
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting Android application build process...');
  
  try {
    if (!checkRequirements()) {
      console.error('Requirements check failed');
      process.exit(1);
    }
    
    if (!buildWebApp()) {
      console.error('Web application build failed');
      process.exit(1);
    }
    
    if (!buildAndroidApp()) {
      console.error('Android application build failed');
      process.exit(1);
    }
    
    console.log('Android application built successfully!');
    console.log(`You can find the APK file at: ${path.join(buildDir, 'codelingo.apk')}`);
  } catch (error) {
    console.error('An error occurred during Android application build:', error);
    process.exit(1);
  }
}

// Execute main function
main(); 