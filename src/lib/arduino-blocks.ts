import * as Blockly from 'blockly';

// Define Arduino-specific blocks
export const defineArduinoBlocks = () => {
  // Setup and Loop structure
  Blockly.Blocks['arduino_setup_loop'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Arduino Program');
      this.appendStatementInput('SETUP')
        .setCheck(null)
        .appendField('setup()');
      this.appendStatementInput('LOOP')
        .setCheck(null)
        .appendField('loop()');
      this.setColour(180);
      this.setTooltip('The main Arduino program structure with setup and loop functions');
    }
  };

  // pinMode
  Blockly.Blocks['arduino_pin_mode'] = {
    init: function() {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('pinMode pin');
      this.appendDummyInput()
        .appendField('mode')
        .appendField(new Blockly.FieldDropdown([
          ['INPUT', 'INPUT'],
          ['OUTPUT', 'OUTPUT'],
          ['INPUT_PULLUP', 'INPUT_PULLUP']
        ]), 'MODE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Configure a pin as INPUT, OUTPUT, or INPUT_PULLUP');
    }
  };

  // digitalWrite
  Blockly.Blocks['arduino_digital_write'] = {
    init: function() {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('digitalWrite pin');
      this.appendDummyInput()
        .appendField('value')
        .appendField(new Blockly.FieldDropdown([
          ['HIGH', 'HIGH'],
          ['LOW', 'LOW']
        ]), 'VALUE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Write HIGH or LOW to a digital pin');
    }
  };

  // digitalRead
  Blockly.Blocks['arduino_digital_read'] = {
    init: function() {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('digitalRead pin');
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Read digital value (HIGH/LOW) from a pin');
    }
  };

  // analogWrite (PWM)
  Blockly.Blocks['arduino_analog_write'] = {
    init: function() {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('analogWrite pin');
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('value (0-255)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Write analog value (PWM 0-255) to a pin');
    }
  };

  // analogRead
  Blockly.Blocks['arduino_analog_read'] = {
    init: function() {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('analogRead pin');
      this.setOutput(true, 'Number');
      this.setColour(120);
      this.setTooltip('Read analog value (0-1023) from a pin');
    }
  };

  // delay
  Blockly.Blocks['arduino_delay'] = {
    init: function() {
      this.appendValueInput('TIME')
        .setCheck('Number')
        .appendField('delay');
      this.appendDummyInput()
        .appendField('milliseconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(60);
      this.setTooltip('Pause program for specified milliseconds');
    }
  };

  // delayMicroseconds
  Blockly.Blocks['arduino_delay_microseconds'] = {
    init: function() {
      this.appendValueInput('TIME')
        .setCheck('Number')
        .appendField('delayMicroseconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(60);
      this.setTooltip('Pause program for specified microseconds');
    }
  };

  // millis
  Blockly.Blocks['arduino_millis'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('millis()');
      this.setOutput(true, 'Number');
      this.setColour(60);
      this.setTooltip('Returns milliseconds since program started');
    }
  };

  // micros
  Blockly.Blocks['arduino_micros'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('micros()');
      this.setOutput(true, 'Number');
      this.setColour(60);
      this.setTooltip('Returns microseconds since program started');
    }
  };

  // Serial.begin
  Blockly.Blocks['arduino_serial_begin'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Serial.begin')
        .appendField(new Blockly.FieldDropdown([
          ['9600', '9600'],
          ['115200', '115200'],
          ['57600', '57600'],
          ['38400', '38400'],
          ['19200', '19200'],
          ['4800', '4800'],
          ['2400', '2400'],
          ['1200', '1200']
        ]), 'BAUD');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip('Initialize serial communication at specified baud rate');
    }
  };

  // Serial.print
  Blockly.Blocks['arduino_serial_print'] = {
    init: function() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('Serial.print');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip('Print value to serial monitor (no newline)');
    }
  };

  // Serial.println
  Blockly.Blocks['arduino_serial_println'] = {
    init: function() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('Serial.println');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip('Print value to serial monitor with newline');
    }
  };

  // Serial.available
  Blockly.Blocks['arduino_serial_available'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Serial.available()');
      this.setOutput(true, 'Number');
      this.setColour(200);
      this.setTooltip('Returns number of bytes available to read');
    }
  };

  // Serial.read
  Blockly.Blocks['arduino_serial_read'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Serial.read()');
      this.setOutput(true, 'Number');
      this.setColour(200);
      this.setTooltip('Read one byte from serial buffer');
    }
  };

  // Pin number
  Blockly.Blocks['arduino_pin_number'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('pin')
        .appendField(new Blockly.FieldDropdown([
          ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'],
          ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'],
          ['8', '8'], ['9', '9'], ['10', '10'], ['11', '11'],
          ['12', '12'], ['13', '13'],
          ['A0', 'A0'], ['A1', 'A1'], ['A2', 'A2'],
          ['A3', 'A3'], ['A4', 'A4'], ['A5', 'A5']
        ]), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Arduino pin number');
    }
  };

  // LED_BUILTIN
  Blockly.Blocks['arduino_led_builtin'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('LED_BUILTIN');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Built-in LED pin (usually pin 13)');
    }
  };

  // HIGH/LOW constants
  Blockly.Blocks['arduino_high_low'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['HIGH', 'HIGH'],
          ['LOW', 'LOW']
        ]), 'VALUE');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('HIGH (1) or LOW (0) constant');
    }
  };

  // map function
  Blockly.Blocks['arduino_map'] = {
    init: function() {
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('map');
      this.appendValueInput('FROM_LOW')
        .setCheck('Number')
        .appendField('from low');
      this.appendValueInput('FROM_HIGH')
        .setCheck('Number')
        .appendField('from high');
      this.appendValueInput('TO_LOW')
        .setCheck('Number')
        .appendField('to low');
      this.appendValueInput('TO_HIGH')
        .setCheck('Number')
        .appendField('to high');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Map a value from one range to another');
    }
  };

  // constrain
  Blockly.Blocks['arduino_constrain'] = {
    init: function() {
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('constrain');
      this.appendValueInput('LOW')
        .setCheck('Number')
        .appendField('min');
      this.appendValueInput('HIGH')
        .setCheck('Number')
        .appendField('max');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Constrain a value between min and max');
    }
  };

  // tone
  Blockly.Blocks['arduino_tone'] = {
    init: function() {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('tone pin');
      this.appendValueInput('FREQ')
        .setCheck('Number')
        .appendField('frequency');
      this.appendValueInput('DURATION')
        .setCheck('Number')
        .appendField('duration (ms)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(280);
      this.setTooltip('Generate a square wave on a pin (for piezo buzzers)');
    }
  };

  // noTone
  Blockly.Blocks['arduino_no_tone'] = {
    init: function() {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('noTone pin');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(280);
      this.setTooltip('Stop tone generation on a pin');
    }
  };

  // Servo blocks
  Blockly.Blocks['arduino_servo_attach'] = {
    init: function() {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('servo attach pin');
      this.appendDummyInput()
        .appendField('as')
        .appendField(new Blockly.FieldDropdown([
          ['servo1', 'servo1'],
          ['servo2', 'servo2'],
          ['servo3', 'servo3']
        ]), 'SERVO');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(280);
      this.setTooltip('Attach a servo motor to a pin');
    }
  };

  Blockly.Blocks['arduino_servo_write'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['servo1', 'servo1'],
          ['servo2', 'servo2'],
          ['servo3', 'servo3']
        ]), 'SERVO');
      this.appendValueInput('ANGLE')
        .setCheck('Number')
        .appendField('.write angle');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(280);
      this.setTooltip('Set servo angle (0-180 degrees)');
    }
  };

  // Text/String
  Blockly.Blocks['arduino_text'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput('Hello'), 'TEXT')
        .appendField('"');
      this.setOutput(true, 'String');
      this.setColour(160);
      this.setTooltip('Text string');
    }
  };
};

// Arduino code generator
export const createArduinoGenerator = (): any => {
  const arduinoGenerator: any = new Blockly.Generator('Arduino');
  
  arduinoGenerator.ORDER_ATOMIC = 0;
  arduinoGenerator.ORDER_UNARY_POSTFIX = 1;
  arduinoGenerator.ORDER_UNARY_PREFIX = 2;
  arduinoGenerator.ORDER_MULTIPLICATIVE = 3;
  arduinoGenerator.ORDER_ADDITIVE = 4;
  arduinoGenerator.ORDER_SHIFT = 5;
  arduinoGenerator.ORDER_RELATIONAL = 6;
  arduinoGenerator.ORDER_EQUALITY = 7;
  arduinoGenerator.ORDER_BITWISE_AND = 8;
  arduinoGenerator.ORDER_BITWISE_XOR = 9;
  arduinoGenerator.ORDER_BITWISE_OR = 10;
  arduinoGenerator.ORDER_LOGICAL_AND = 11;
  arduinoGenerator.ORDER_LOGICAL_OR = 12;
  arduinoGenerator.ORDER_CONDITIONAL = 13;
  arduinoGenerator.ORDER_ASSIGNMENT = 14;
  arduinoGenerator.ORDER_NONE = 99;

  // Setup includes and variables
  arduinoGenerator.includes_ = {};
  arduinoGenerator.variables_ = {};
  arduinoGenerator.setups_ = {};

  arduinoGenerator.init = function(workspace: Blockly.Workspace) {
    this.includes_ = {};
    this.variables_ = {};
    this.setups_ = {};
    
    // Get all variables from workspace
    const variables = workspace.getVariableMap().getAllVariables();
    for (const variable of variables) {
      this.variables_[variable.name] = `int ${variable.name} = 0;`;
    }
  };

  arduinoGenerator.finish = function(code: string) {
    // Build includes
    let includes = '';
    for (const key in this.includes_) {
      includes += this.includes_[key] + '\n';
    }
    
    // Build variable declarations
    let variables = '';
    for (const key in this.variables_) {
      variables += this.variables_[key] + '\n';
    }
    
    if (includes || variables) {
      return includes + '\n' + variables + '\n' + code;
    }
    return code;
  };

  arduinoGenerator.scrubNakedValue = function(line: string) {
    return line + ';\n';
  };

  arduinoGenerator.scrub_ = function(block: Blockly.Block, code: string) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = this.blockToCode(nextBlock);
    return code + nextCode;
  };

  // Block generators
  arduinoGenerator.forBlock = arduinoGenerator.forBlock || {};

  arduinoGenerator.forBlock['arduino_setup_loop'] = function(block: Blockly.Block) {
    const setupCode = arduinoGenerator.statementToCode(block, 'SETUP');
    const loopCode = arduinoGenerator.statementToCode(block, 'LOOP');
    
    return `void setup() {\n${setupCode}}\n\nvoid loop() {\n${loopCode}}\n`;
  };

  arduinoGenerator.forBlock['arduino_pin_mode'] = function(block: Blockly.Block) {
    const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '0';
    const mode = block.getFieldValue('MODE');
    return `pinMode(${pin}, ${mode});\n`;
  };

  arduinoGenerator.forBlock['arduino_digital_write'] = function(block: Blockly.Block) {
    const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '0';
    const value = block.getFieldValue('VALUE');
    return `digitalWrite(${pin}, ${value});\n`;
  };

  arduinoGenerator.forBlock['arduino_digital_read'] = function(block: Blockly.Block) {
    const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '0';
    return [`digitalRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_analog_write'] = function(block: Blockly.Block) {
    const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '0';
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    return `analogWrite(${pin}, ${value});\n`;
  };

  arduinoGenerator.forBlock['arduino_analog_read'] = function(block: Blockly.Block) {
    const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || 'A0';
    return [`analogRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_delay'] = function(block: Blockly.Block) {
    const time = arduinoGenerator.valueToCode(block, 'TIME', arduinoGenerator.ORDER_ATOMIC) || '1000';
    return `delay(${time});\n`;
  };

  arduinoGenerator.forBlock['arduino_delay_microseconds'] = function(block: Blockly.Block) {
    const time = arduinoGenerator.valueToCode(block, 'TIME', arduinoGenerator.ORDER_ATOMIC) || '1000';
    return `delayMicroseconds(${time});\n`;
  };

  arduinoGenerator.forBlock['arduino_millis'] = function() {
    return ['millis()', arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_micros'] = function() {
    return ['micros()', arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_serial_begin'] = function(block: Blockly.Block) {
    const baud = block.getFieldValue('BAUD');
    return `Serial.begin(${baud});\n`;
  };

  arduinoGenerator.forBlock['arduino_serial_print'] = function(block: Blockly.Block) {
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '""';
    return `Serial.print(${value});\n`;
  };

  arduinoGenerator.forBlock['arduino_serial_println'] = function(block: Blockly.Block) {
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '""';
    return `Serial.println(${value});\n`;
  };

  arduinoGenerator.forBlock['arduino_serial_available'] = function() {
    return ['Serial.available()', arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_serial_read'] = function() {
    return ['Serial.read()', arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_pin_number'] = function(block: Blockly.Block) {
    const pin = block.getFieldValue('PIN');
    return [pin, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_led_builtin'] = function() {
    return ['LED_BUILTIN', arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_high_low'] = function(block: Blockly.Block) {
    const value = block.getFieldValue('VALUE');
    return [value, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_map'] = function(block: Blockly.Block) {
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    const fromLow = arduinoGenerator.valueToCode(block, 'FROM_LOW', arduinoGenerator.ORDER_ATOMIC) || '0';
    const fromHigh = arduinoGenerator.valueToCode(block, 'FROM_HIGH', arduinoGenerator.ORDER_ATOMIC) || '1023';
    const toLow = arduinoGenerator.valueToCode(block, 'TO_LOW', arduinoGenerator.ORDER_ATOMIC) || '0';
    const toHigh = arduinoGenerator.valueToCode(block, 'TO_HIGH', arduinoGenerator.ORDER_ATOMIC) || '255';
    return [`map(${value}, ${fromLow}, ${fromHigh}, ${toLow}, ${toHigh})`, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_constrain'] = function(block: Blockly.Block) {
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
    const low = arduinoGenerator.valueToCode(block, 'LOW', arduinoGenerator.ORDER_ATOMIC) || '0';
    const high = arduinoGenerator.valueToCode(block, 'HIGH', arduinoGenerator.ORDER_ATOMIC) || '255';
    return [`constrain(${value}, ${low}, ${high})`, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['arduino_tone'] = function(block: Blockly.Block) {
    const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '0';
    const freq = arduinoGenerator.valueToCode(block, 'FREQ', arduinoGenerator.ORDER_ATOMIC) || '440';
    const duration = arduinoGenerator.valueToCode(block, 'DURATION', arduinoGenerator.ORDER_ATOMIC) || '1000';
    return `tone(${pin}, ${freq}, ${duration});\n`;
  };

  arduinoGenerator.forBlock['arduino_no_tone'] = function(block: Blockly.Block) {
    const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '0';
    return `noTone(${pin});\n`;
  };

  arduinoGenerator.forBlock['arduino_servo_attach'] = function(block: Blockly.Block) {
    const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '9';
    const servo = block.getFieldValue('SERVO');
    arduinoGenerator.includes_['servo'] = '#include <Servo.h>';
    arduinoGenerator.variables_[servo] = `Servo ${servo};`;
    return `${servo}.attach(${pin});\n`;
  };

  arduinoGenerator.forBlock['arduino_servo_write'] = function(block: Blockly.Block) {
    const servo = block.getFieldValue('SERVO');
    const angle = arduinoGenerator.valueToCode(block, 'ANGLE', arduinoGenerator.ORDER_ATOMIC) || '90';
    return `${servo}.write(${angle});\n`;
  };

  arduinoGenerator.forBlock['arduino_text'] = function(block: Blockly.Block) {
    const text = block.getFieldValue('TEXT');
    return [`"${text}"`, arduinoGenerator.ORDER_ATOMIC];
  };

  // Standard Blockly blocks
  arduinoGenerator.forBlock['math_number'] = function(block: Blockly.Block) {
    const code = Number(block.getFieldValue('NUM'));
    return [code, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['math_arithmetic'] = function(block: Blockly.Block) {
    const operators: { [key: string]: [string, number] } = {
      'ADD': [' + ', arduinoGenerator.ORDER_ADDITIVE],
      'MINUS': [' - ', arduinoGenerator.ORDER_ADDITIVE],
      'MULTIPLY': [' * ', arduinoGenerator.ORDER_MULTIPLICATIVE],
      'DIVIDE': [' / ', arduinoGenerator.ORDER_MULTIPLICATIVE],
      'POWER': ['pow(', arduinoGenerator.ORDER_ATOMIC]
    };
    const op = block.getFieldValue('OP');
    const tuple = operators[op];
    const operator = tuple[0];
    const order = tuple[1];
    const argument0 = arduinoGenerator.valueToCode(block, 'A', order) || '0';
    const argument1 = arduinoGenerator.valueToCode(block, 'B', order) || '0';
    let code;
    if (op === 'POWER') {
      code = `pow(${argument0}, ${argument1})`;
    } else {
      code = argument0 + operator + argument1;
    }
    return [code, order];
  };

  arduinoGenerator.forBlock['logic_compare'] = function(block: Blockly.Block) {
    const operators: { [key: string]: string } = {
      'EQ': '==',
      'NEQ': '!=',
      'LT': '<',
      'LTE': '<=',
      'GT': '>',
      'GTE': '>='
    };
    const op = operators[block.getFieldValue('OP')];
    const argument0 = arduinoGenerator.valueToCode(block, 'A', arduinoGenerator.ORDER_RELATIONAL) || '0';
    const argument1 = arduinoGenerator.valueToCode(block, 'B', arduinoGenerator.ORDER_RELATIONAL) || '0';
    const code = `${argument0} ${op} ${argument1}`;
    return [code, arduinoGenerator.ORDER_RELATIONAL];
  };

  arduinoGenerator.forBlock['logic_operation'] = function(block: Blockly.Block) {
    const op = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
    const order = block.getFieldValue('OP') === 'AND' ? 
      arduinoGenerator.ORDER_LOGICAL_AND : arduinoGenerator.ORDER_LOGICAL_OR;
    const argument0 = arduinoGenerator.valueToCode(block, 'A', order) || 'false';
    const argument1 = arduinoGenerator.valueToCode(block, 'B', order) || 'false';
    const code = `${argument0} ${op} ${argument1}`;
    return [code, order];
  };

  arduinoGenerator.forBlock['logic_negate'] = function(block: Blockly.Block) {
    const argument0 = arduinoGenerator.valueToCode(block, 'BOOL', arduinoGenerator.ORDER_UNARY_PREFIX) || 'true';
    const code = `!${argument0}`;
    return [code, arduinoGenerator.ORDER_UNARY_PREFIX];
  };

  arduinoGenerator.forBlock['logic_boolean'] = function(block: Blockly.Block) {
    const code = block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false';
    return [code, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['controls_if'] = function(block: Blockly.Block) {
    let n = 0;
    let code = '';
    let branchCode, conditionCode;
    
    do {
      conditionCode = arduinoGenerator.valueToCode(block, 'IF' + n, arduinoGenerator.ORDER_NONE) || 'false';
      branchCode = arduinoGenerator.statementToCode(block, 'DO' + n);
      code += (n > 0 ? ' else ' : '') + `if (${conditionCode}) {\n${branchCode}}`;
      n++;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE')) {
      branchCode = arduinoGenerator.statementToCode(block, 'ELSE');
      code += ` else {\n${branchCode}}`;
    }
    return code + '\n';
  };

  arduinoGenerator.forBlock['controls_repeat_ext'] = function(block: Blockly.Block) {
    const times = arduinoGenerator.valueToCode(block, 'TIMES', arduinoGenerator.ORDER_ATOMIC) || '10';
    const branch = arduinoGenerator.statementToCode(block, 'DO');
    return `for (int i = 0; i < ${times}; i++) {\n${branch}}\n`;
  };

  arduinoGenerator.forBlock['controls_whileUntil'] = function(block: Blockly.Block) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    let argument0 = arduinoGenerator.valueToCode(block, 'BOOL', arduinoGenerator.ORDER_NONE) || 'false';
    const branch = arduinoGenerator.statementToCode(block, 'DO');
    if (until) {
      argument0 = `!${argument0}`;
    }
    return `while (${argument0}) {\n${branch}}\n`;
  };

  arduinoGenerator.forBlock['controls_for'] = function(block: Blockly.Block) {
    const variable = arduinoGenerator.getVariableName(block.getFieldValue('VAR'));
    const argument0 = arduinoGenerator.valueToCode(block, 'FROM', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    const argument1 = arduinoGenerator.valueToCode(block, 'TO', arduinoGenerator.ORDER_ASSIGNMENT) || '10';
    const increment = arduinoGenerator.valueToCode(block, 'BY', arduinoGenerator.ORDER_ASSIGNMENT) || '1';
    const branch = arduinoGenerator.statementToCode(block, 'DO');
    return `for (int ${variable} = ${argument0}; ${variable} <= ${argument1}; ${variable} += ${increment}) {\n${branch}}\n`;
  };

  arduinoGenerator.forBlock['variables_get'] = function(block: Blockly.Block) {
    const varName = arduinoGenerator.getVariableName(block.getFieldValue('VAR'));
    return [varName, arduinoGenerator.ORDER_ATOMIC];
  };

  arduinoGenerator.forBlock['variables_set'] = function(block: Blockly.Block) {
    const varName = arduinoGenerator.getVariableName(block.getFieldValue('VAR'));
    const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
    return `${varName} = ${value};\n`;
  };

  arduinoGenerator.getVariableName = function(id: string) {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  };

  return arduinoGenerator;
};

// Toolbox configuration
export const arduinoToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Basics',
      colour: '180',
      contents: [
        { kind: 'block', type: 'arduino_setup_loop' },
        { kind: 'block', type: 'arduino_pin_number' },
        { kind: 'block', type: 'arduino_led_builtin' },
        { kind: 'block', type: 'arduino_high_low' }
      ]
    },
    {
      kind: 'category',
      name: 'Digital I/O',
      colour: '160',
      contents: [
        { kind: 'block', type: 'arduino_pin_mode' },
        { kind: 'block', type: 'arduino_digital_write' },
        { kind: 'block', type: 'arduino_digital_read' }
      ]
    },
    {
      kind: 'category',
      name: 'Analog',
      colour: '120',
      contents: [
        { kind: 'block', type: 'arduino_analog_read' },
        { kind: 'block', type: 'arduino_analog_write' }
      ]
    },
    {
      kind: 'category',
      name: 'Serial',
      colour: '200',
      contents: [
        { kind: 'block', type: 'arduino_serial_begin' },
        { kind: 'block', type: 'arduino_serial_print' },
        { kind: 'block', type: 'arduino_serial_println' },
        { kind: 'block', type: 'arduino_serial_available' },
        { kind: 'block', type: 'arduino_serial_read' }
      ]
    },
    {
      kind: 'category',
      name: 'Timing',
      colour: '60',
      contents: [
        { kind: 'block', type: 'arduino_delay' },
        { kind: 'block', type: 'arduino_delay_microseconds' },
        { kind: 'block', type: 'arduino_millis' },
        { kind: 'block', type: 'arduino_micros' }
      ]
    },
    {
      kind: 'category',
      name: 'Math',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'arduino_map' },
        { kind: 'block', type: 'arduino_constrain' }
      ]
    },
    {
      kind: 'category',
      name: 'Logic',
      colour: '210',
      contents: [
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'controls_if' }
      ]
    },
    {
      kind: 'category',
      name: 'Loops',
      colour: '120',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' }
      ]
    },
    {
      kind: 'category',
      name: 'Text',
      colour: '160',
      contents: [
        { kind: 'block', type: 'arduino_text' }
      ]
    },
    {
      kind: 'category',
      name: 'Variables',
      colour: '330',
      custom: 'VARIABLE'
    },
    {
      kind: 'category',
      name: 'Actuators',
      colour: '280',
      contents: [
        { kind: 'block', type: 'arduino_tone' },
        { kind: 'block', type: 'arduino_no_tone' },
        { kind: 'block', type: 'arduino_servo_attach' },
        { kind: 'block', type: 'arduino_servo_write' }
      ]
    }
  ]
};
