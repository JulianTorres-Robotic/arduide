// src/lib/webserial.ts

interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  setSignals(signals: { dataTerminalReady?: boolean; requestToSend?: boolean }): Promise<void>;
  getSignals(): Promise<{ dataCarrierDetect: boolean; clearToSend: boolean; ringIndicator: boolean; dataSetReady: boolean }>;
}

interface Serial {
  requestPort(): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

declare global {
  interface Navigator {
    serial: Serial;
  }
}

export interface SerialConnection {
  port: SerialPort;
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  writer: WritableStreamDefaultWriter<Uint8Array> | null;
  isConnected: boolean;
}

export interface ArduinoBoard {
  name: string;
  fqbn: string;
  uploadProtocol: string;
  baudRate: number;
}

// Configuración unificada - Auto-detect habilitado
export const ARDUINO_BOARDS: ArduinoBoard[] = [
  { name: 'Arduino Uno', fqbn: 'arduino:avr:uno', uploadProtocol: 'stk500v1', baudRate: 115200 },
  { name: 'Arduino Nano', fqbn: 'arduino:avr:nano', uploadProtocol: 'stk500v1', baudRate: 115200 },
  { name: 'Arduino Nano (Old Bootloader)', fqbn: 'arduino:avr:nano:cpu=atmega328old', uploadProtocol: 'stk500v1', baudRate: 57600 },
  { name: 'Arduino Mega', fqbn: 'arduino:avr:mega', uploadProtocol: 'stk500v2', baudRate: 115200 }
];

export const isWebSerialSupported = (): boolean => 'serial' in navigator;

export const requestSerialPort = async (): Promise<SerialPort | null> => {
  if (!isWebSerialSupported()) throw new Error('WebSerial not supported');
  try { return await navigator.serial.requestPort(); }
  catch (error) { if (error instanceof DOMException && error.name === 'NotFoundError') return null; throw error; }
};

export const openSerialConnection = async (port: SerialPort, baudRate: number = 9600): Promise<SerialConnection> => {
  await port.open({ baudRate });
  return { port, reader: port.readable?.getReader() ?? null, writer: port.writable?.getWriter() ?? null, isConnected: true };
};

export const closeSerialConnection = async (connection: SerialConnection): Promise<void> => {
  const { reader, writer, port } = connection;
  try { if (reader) { await reader.cancel(); reader.releaseLock(); } } catch (e) { console.warn(e); }
  try { if (writer) { await writer.close(); writer.releaseLock(); } } catch (e) { console.warn(e); }
  try { await port.close(); } catch (e) { console.warn(e); }
};

export const writeToSerial = async (connection: SerialConnection, data: string): Promise<void> => {
  if (!connection.writer) throw new Error('No writer');
  await connection.writer.write(new TextEncoder().encode(data));
};

const STK_OK = 0x10;
const STK_INSYNC = 0x14;
const STK_GET_SYNC = 0x30;
const STK_ENTER_PROGMODE = 0x50;
const STK_LEAVE_PROGMODE = 0x51;
const STK_LOAD_ADDRESS = 0x55;
const STK_PROG_PAGE = 0x64;
const CRC_EOP = 0x20;

export interface UploadProgress {
  stage: 'connecting' | 'syncing' | 'uploading' | 'verifying' | 'done' | 'error';
  progress: number;
  message: string;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;
export type DebugLogCallback = (message: string) => void;

export const parseHexFile = (hexContent: string): Uint8Array => {
  const lines = hexContent.split('\n').filter(line => line.startsWith(':'));
  const data: number[] = [];
  for (const line of lines) {
    const byteCount = parseInt(line.substring(1, 3), 16);
    const recordType = parseInt(line.substring(7, 9), 16);
    if (recordType === 0x00) {
      for (let i = 0; i < byteCount; i++) {
        data.push(parseInt(line.substring(9 + i * 2, 11 + i * 2), 16));
      }
    }
  }
  return new Uint8Array(data);
};

// Robust read function that collects data with timeout
const readWithTimeout = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  timeoutMs: number,
  onDebug?: DebugLogCallback
): Promise<Uint8Array> => {
  const buffer: number[] = [];
  const startTime = Date.now();
  
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
  
  try {
    while (Date.now() - startTime < timeoutMs) {
      const remainingTime = timeoutMs - (Date.now() - startTime);
      if (remainingTime <= 0) break;
      
      const readResult = await Promise.race([
        reader.read(),
        new Promise<{ value: undefined; done: true }>((resolve) => 
          setTimeout(() => resolve({ value: undefined, done: true }), Math.min(remainingTime, 100))
        )
      ]);
      
      if (readResult.value && readResult.value.length > 0) {
        buffer.push(...readResult.value);
        // Descomentar para debug extremo:
        // const hex = Array.from(readResult.value).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');
        // if (onDebug) onDebug(`[RX] ${hex}`);
        
        if (buffer.includes(STK_INSYNC) && buffer.includes(STK_OK)) {
          break;
        }
      }
      
      if (readResult.done) break;
    }
  } catch (e) {
    // Ignore timeout
  } finally {
    clearTimeout(timeoutId);
  }
  
  return new Uint8Array(buffer);
};

// --- ESTRATEGIA DE RESET MEJORADA ---

const resetBoardDTR = async (port: SerialPort, onDebug?: DebugLogCallback): Promise<void> => {
  if(onDebug) onDebug('Reset DTR...');
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  await new Promise(r => setTimeout(r, 50));
  await port.setSignals({ dataTerminalReady: true, requestToSend: false });
  await new Promise(r => setTimeout(r, 250)); // Pulso más largo
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
};

const resetBoardRTS = async (port: SerialPort, onDebug?: DebugLogCallback): Promise<void> => {
  if(onDebug) onDebug('Reset RTS...');
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  await new Promise(r => setTimeout(r, 50));
  await port.setSignals({ dataTerminalReady: false, requestToSend: true });
  await new Promise(r => setTimeout(r, 250)); // Pulso más largo
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
};

const resetBoardCombined = async (port: SerialPort, onDebug?: DebugLogCallback): Promise<void> => {
  const log = (msg: string) => { console.log(`[WebSerial] ${msg}`); if (onDebug) onDebug(msg); };
  log('Ejecutando Reset Automático (DTR+RTS)...');
  
  // 1. Apagar señales
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  await new Promise(r => setTimeout(r, 50));
  
  // 2. Pulso de RESET robusto (250ms)
  await port.setSignals({ dataTerminalReady: true, requestToSend: true });
  await new Promise(r => setTimeout(r, 250));
  
  // 3. Soltar RESET
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  
  // 4. Espera mínima técnica (100ms) - NO esperamos 300ms, empezamos a buscar YA
  await new Promise(r => setTimeout(r, 100));
};

type ResetMethod = 'dtr' | 'rts' | 'combined';

const attemptSync = async (
  port: SerialPort,
  baudRate: number,
  resetMethod: ResetMethod,
  onProgress: UploadProgressCallback,
  onDebug?: DebugLogCallback
): Promise<{ success: boolean; reader: ReadableStreamDefaultReader<Uint8Array> | null; writer: WritableStreamDefaultWriter<Uint8Array> | null }> => {
  const log = (msg: string) => { console.log(`[WebSerial] ${msg}`); if (onDebug) onDebug(msg); };

  log(`━━━ Intento ${baudRate} baud (${resetMethod}) ━━━`);
  
  try {
    await port.open({ baudRate });
  } catch (e) {
    log(`Puerto ocupado o error: ${e}`);
    return { success: false, reader: null, writer: null };
  }

  const writer = port.writable?.getWriter();
  const reader = port.readable?.getReader();

  if (!writer || !reader) {
    try { await port.close(); } catch {}
    return { success: false, reader: null, writer: null };
  }

  // Ejecutar Reset
  switch (resetMethod) {
    case 'dtr': await resetBoardDTR(port, onDebug); break;
    case 'rts': await resetBoardRTS(port, onDebug); break;
    case 'combined': await resetBoardCombined(port, onDebug); break;
  }

  // Limpiar basura inicial
  try { await readWithTimeout(reader, 50, onDebug); } catch {}

  onProgress({ stage: 'syncing', progress: 10, message: 'Buscando bootloader...' });
  
  let synced = false;
  // BUCLE AGRESIVO: 40 intentos rápidos (aprox 4 segundos total)
  // Si el auto-reset funciona, entra en el intento 1 o 2.
  // Si no, tienes 4 seg para darle al botón manual.
  const maxAttempts = 40; 
  
  for (let attempt = 0; attempt < maxAttempts && !synced; attempt++) {
    try {
      if (attempt % 5 === 0) log(`Ping... (${attempt + 1}/${maxAttempts})`);
      
      const syncCmd = new Uint8Array([STK_GET_SYNC, CRC_EOP]);
      await writer.write(syncCmd);
      
      // Timeout CORTO (80ms) para iterar rápido
      const response = await readWithTimeout(reader, 80, onDebug);
      
      if (response.length > 0) {
        if (response.includes(STK_INSYNC) && response.includes(STK_OK)) {
          log('✓ ¡CONECTADO!');
          synced = true;
          break;
        }
      }
      // Pequeña pausa entre intentos
      await new Promise(r => setTimeout(r, 50));
    } catch (e) {
      // ignorar errores de escritura en bucle
    }
  }

  if (synced) {
    return { success: true, reader, writer };
  }

  try { await reader.cancel(); reader.releaseLock(); } catch {}
  try { await writer.close(); writer.releaseLock(); } catch {}
  try { await port.close(); } catch {}
  
  return { success: false, reader: null, writer: null };
};

export const uploadToArduino = async (
  port: SerialPort,
  hexData: Uint8Array,
  board: ArduinoBoard,
  onProgress: UploadProgressCallback,
  onDebug?: DebugLogCallback
): Promise<void> => {
  const log = (msg: string) => { console.log(`[WebSerial] ${msg}`); if (onDebug) onDebug(msg); };

  log(`Iniciando upload para ${board.name} (${hexData.length} bytes)`);

  let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let activeWriter: WritableStreamDefaultWriter<Uint8Array> | null = null;

  const isOldBootloader = board.fqbn.includes('atmega328old');
  const baudRates = isOldBootloader ? [57600] : board.name.includes('Nano') ? [115200, 57600] : [board.baudRate];
  
  // Prioridad a 'combined' que es el más común
  const resetMethods: ResetMethod[] = ['combined', 'dtr'];

  let connected = false;
  
  outerLoop:
  for (const baud of baudRates) {
    for (const method of resetMethods) {
      const result = await attemptSync(port, baud, method, onProgress, onDebug);
      
      if (result.success && result.reader && result.writer) {
        activeReader = result.reader;
        activeWriter = result.writer;
        connected = true;
        log(`✓ Conexión establecida a ${baud} baud`);
        break outerLoop;
      }
      // Espera antes de probar otra config
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!connected || !activeReader || !activeWriter) {
    log('✗ Fallo. Si el auto-reset no funciona, prueba pulsar RESET manualmente durante el mensaje "Buscando bootloader..."');
    throw new Error('No se pudo conectar. Intenta reconectar el USB o usar Reset Manual.');
  }

  try {
    log('Modo programación...');
    await activeWriter.write(new Uint8Array([STK_ENTER_PROGMODE, CRC_EOP]));
    await readWithTimeout(activeReader, 200, onDebug);
    
    onProgress({ stage: 'uploading', progress: 20, message: 'Subiendo...' });

    const pageSize = 128;
    const totalPages = Math.ceil(hexData.length / pageSize);

    for (let page = 0; page < totalPages; page++) {
      const addr = page * pageSize;
      const pageData = hexData.slice(addr, addr + pageSize);
      const paddedData = new Uint8Array(pageSize);
      paddedData.fill(0xFF);
      paddedData.set(pageData);

      const wordAddr = addr >> 1;
      const addrCmd = new Uint8Array([STK_LOAD_ADDRESS, wordAddr & 0xFF, (wordAddr >> 8) & 0xFF, CRC_EOP]);
      
      await activeWriter.write(addrCmd);
      await readWithTimeout(activeReader, 100);

      const progCmd = new Uint8Array([STK_PROG_PAGE, (paddedData.length >> 8) & 0xFF, paddedData.length & 0xFF, 0x46]);
      const fullPacket = new Uint8Array(progCmd.length + paddedData.length + 1);
      fullPacket.set(progCmd, 0);
      fullPacket.set(paddedData, progCmd.length);
      fullPacket[fullPacket.length - 1] = CRC_EOP;

      await activeWriter.write(fullPacket);
      await readWithTimeout(activeReader, 500);

      const progress = 20 + ((page + 1) / totalPages) * 70;
      onProgress({
        stage: 'uploading',
        progress,
        message: `Subiendo... ${Math.round(((page + 1) / totalPages) * 100)}%`,
      });
    }

    onProgress({ stage: 'verifying', progress: 95, message: 'Finalizando...' });
    await activeWriter.write(new Uint8Array([STK_LEAVE_PROGMODE, CRC_EOP]));
    await readWithTimeout(activeReader, 200);

    onProgress({ stage: 'done', progress: 100, message: '¡Subida exitosa!' });
    log('✓ FIN.');

  } finally {
    if (activeReader) { try { await activeReader.cancel(); activeReader.releaseLock(); } catch {} }
    if (activeWriter) { try { await activeWriter.close(); activeWriter.releaseLock(); } catch {} }
    try { await port.close(); } catch {}
  }
};