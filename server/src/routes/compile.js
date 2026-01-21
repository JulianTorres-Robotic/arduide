const express = require('express');
const { body, validationResult } = require('express-validator');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Arduino CLI path (configurable via env)
const ARDUINO_CLI = process.env.ARDUINO_CLI_PATH || 'arduino-cli';

// Supported boards
const SUPPORTED_BOARDS = {
  'arduino:avr:uno': { name: 'Arduino Uno', core: 'arduino:avr' },
  'arduino:avr:nano:cpu=atmega328': { name: 'Arduino Nano', core: 'arduino:avr' },
  'arduino:avr:nano:cpu=atmega328old': { name: 'Arduino Nano (Old Bootloader)', core: 'arduino:avr' },
  'arduino:avr:mega:cpu=atmega2560': { name: 'Arduino Mega 2560', core: 'arduino:avr' },
  'arduino:avr:leonardo': { name: 'Arduino Leonardo', core: 'arduino:avr' },
  'arduino:avr:micro': { name: 'Arduino Micro', core: 'arduino:avr' },
};

/**
 * GET /api/compile/boards
 * List available boards
 */
router.get('/boards', (req, res) => {
  const boards = Object.entries(SUPPORTED_BOARDS).map(([fqbn, info]) => ({
    fqbn,
    name: info.name,
  }));
  res.json({ boards });
});

/**
 * POST /api/compile
 * Compile Arduino code and return HEX file
 */
router.post('/', [
  body('code').notEmpty().withMessage('Code is required'),
  body('board').notEmpty().withMessage('Board FQBN is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { code, board } = req.body;

  // Validate board
  if (!SUPPORTED_BOARDS[board]) {
    return res.status(400).json({
      success: false,
      error: `Unsupported board: ${board}. Supported boards: ${Object.keys(SUPPORTED_BOARDS).join(', ')}`
    });
  }

  const buildId = uuidv4();
  const buildDir = path.join('/tmp', 'arduino-builds', buildId);
  const sketchDir = path.join(buildDir, 'sketch');
  const sketchFile = path.join(sketchDir, 'sketch.ino');
  const outputDir = path.join(buildDir, 'output');

  try {
    // Create directories
    fs.mkdirSync(sketchDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });

    // Write sketch file
    fs.writeFileSync(sketchFile, code);

    // Compile using arduino-cli
    const compileCmd = `${ARDUINO_CLI} compile --fqbn ${board} --output-dir ${outputDir} ${sketchDir} 2>&1`;

    let output;
    try {
      output = execSync(compileCmd, {
        encoding: 'utf-8',
        timeout: 120000, // 2 minute timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
    } catch (compileError) {
      // Compilation failed
      return res.json({
        success: false,
        error: extractErrorMessage(compileError.stdout || compileError.message),
        output: compileError.stdout || compileError.message,
      });
    }

    // Find and read the HEX file
    const hexFile = path.join(outputDir, 'sketch.ino.hex');

    if (!fs.existsSync(hexFile)) {
      return res.json({
        success: false,
        error: 'Compilation succeeded but HEX file not found',
        output,
      });
    }

    const hexContent = fs.readFileSync(hexFile, 'utf-8');

    // Parse size information from output
    const sizeInfo = parseSizeInfo(output);

    res.json({
      success: true,
      hex: hexContent,
      output,
      size: sizeInfo,
    });

  } catch (error) {
    console.error('Compile error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    // Cleanup build directory
    try {
      fs.rmSync(buildDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }
});

/**
 * POST /api/compile/validate
 * Quick validation without generating HEX (faster)
 */
router.post('/validate', [
  body('code').notEmpty()
], async (req, res) => {
  const { code } = req.body;

  // Basic validation checks
  const errors = [];

  // Check for setup() function
  if (!code.includes('void setup()') && !code.includes('void setup ()')) {
    errors.push('Missing setup() function');
  }

  // Check for loop() function
  if (!code.includes('void loop()') && !code.includes('void loop ()')) {
    errors.push('Missing loop() function');
  }

  // Check for matching braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Unmatched braces: ${openBraces} opening, ${closeBraces} closing`);
  }

  // Check for common syntax errors
  const lines = code.split('\n');
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed === '') {
      return;
    }

    // Check for missing semicolons (simple heuristic)
    if (trimmed.endsWith(')') && 
        !trimmed.startsWith('if') && 
        !trimmed.startsWith('while') && 
        !trimmed.startsWith('for') &&
        !trimmed.startsWith('else') &&
        !trimmed.includes('{')) {
      // Could be a function call without semicolon
      // This is just a heuristic, not perfect
    }
  });

  res.json({
    valid: errors.length === 0,
    errors
  });
});

/**
 * Extract meaningful error message from compiler output
 */
function extractErrorMessage(output) {
  if (!output) return 'Unknown compilation error';

  const lines = output.split('\n');
  const errorLines = lines.filter(line =>
    line.includes('error:') ||
    line.includes('Error:') ||
    line.includes('undefined reference')
  );

  if (errorLines.length > 0) {
    return errorLines.slice(0, 5).join('\n');
  }

  return output.slice(0, 500);
}

/**
 * Parse size information from compiler output
 */
function parseSizeInfo(output) {
  const flashMatch = output.match(/Sketch uses (\d+) bytes/);
  const ramMatch = output.match(/Global variables use (\d+) bytes/);

  return {
    flash: flashMatch ? parseInt(flashMatch[1]) : null,
    ram: ramMatch ? parseInt(ramMatch[1]) : null,
  };
}

module.exports = router;
