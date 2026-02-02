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

// Configuración unificada
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
  const lines = hexContent.split('\n').filter(line => line.trim().startsWith(':'));
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

// --- LECTURA ROBUSTA ---
const readWithTimeout = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  timeoutMs: number,
  onDebug?: DebugLogCallback
): Promise<Uint8Array> => {
  const buffer: number[] = [];
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const readPromise = reader.read();
    // Timeout pequeño interno para polling rápido
    const timeoutPromise = new Promise<{ value: undefined; done: boolean }>((resolve) =>
      setTimeout(() => resolve({ value: undefined, done: false }), 20)
    );

    const { value, done } = await Promise.race([readPromise, timeoutPromise]);

    if (value) {
      buffer.push(...value);
      if (onDebug) {
        const hex = Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(' ');
        onDebug(`[RX] ${hex}`);
      }
      // Si encontramos OK e INSYNC, salimos temprano para acelerar
      if (buffer.includes(STK_INSYNC) && buffer.includes(STK_OK)) break;
    }
    if (done) break;
  }
  return new Uint8Array(buffer);
};

// --- LÓGICA DE RESET AUTOMÁTICO ---

const toggleReset = async (port: SerialPort, onDebug?: DebugLogCallback): Promise<void> => {
  if (onDebug) onDebug('Ejecutando secuencia Auto-Reset...');
  
  // 1. Asegurar estado inicial "HIGH" (false logicamente en WebSerial API suele ser +V/Desactivado)
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  await new Promise(r => setTimeout(r, 50));

  // 2. Activar RESET (DTR True = Señal activa/Baja = Reset presionado)
  await port.setSignals({ dataTerminalReady: true, requestToSend: true });
  await new Promise(r => setTimeout(r, 250)); // Ancho del pulso de reset

  // 3. Soltar RESET (DTR False = Señal alta = Arrancar)
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });

  // 4. TIEMPO DE ARRANQUE DEL BOOTLOADER (CRÍTICO)
  // 250ms suele ser el punto dulce para Uno/Nano. Si es muy corto, falla.
  await new Promise(r => setTimeout(r, 250)); 
};

// --- SINCRONIZACIÓN ---

const syncWithBootloader = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  onDebug?: DebugLogCallback
): Promise<boolean> => {
  const log = (m: string) => { if(onDebug) onDebug(m); };
  
  // Intentamos enviar pings rápidos
  const maxAttempts = 30;
  
  for (let i = 0; i < maxAttempts; i++) {
    // Comando STK_GET_SYNC
    const cmd = new Uint8Array([STK_GET_SYNC, CRC_EOP]);
    try {
      await writer.write(cmd);
      
      // Esperamos respuesta muy corta (50ms). Si el bootloader está vivo, responde inmediato.
      const res = await readWithTimeout(reader, 50, onDebug);
      
      if (res.includes(STK_INSYNC) && res.includes(STK_OK)) {
        log('✓ Bootloader detectado y sincronizado.');
        return true;
      }
    } catch (e) {
      log(`Error escritura sync: ${e}`);
    }
    // Pequeña pausa entre intentos
    await new Promise(r => setTimeout(r, 20));
  }
  return false;
};

// --- FUNCIÓN PRINCIPAL DE UPLOAD ---

export const uploadToArduino = async (
  port: SerialPort,
  hexData: Uint8Array,
  board: ArduinoBoard,
  onProgress: UploadProgressCallback,
  onDebug?: DebugLogCallback
): Promise<void> => {
  const log = (msg: string) => { console.log(`[WebSerial] ${msg}`); if (onDebug) onDebug(msg); };

  // 1. ABRIR PUERTO
  try {
    log(`Abriendo puerto a ${board.baudRate}...`);
    await port.open({ baudRate: board.baudRate });
  } catch (e) {
    // Si ya está abierto, intentamos continuar, si es otro error, fallamos
    if (!(e instanceof DOMException && e.name === 'InvalidStateError')) {
      throw new Error(`Error abriendo puerto: ${e}`);
    }
  }

  const writer = port.writable?.getWriter();
  const reader = port.readable?.getReader();

  if (!writer || !reader) {
    throw new Error('No se pudo obtener writer/reader del puerto.');
  }

  try {
    onProgress({ stage: 'syncing', progress: 0, message: 'Iniciando Auto-Reset...' });

    // 2. RESETEAR
    await toggleReset(port, onDebug);

    // 3. SINCRONIZAR
    onProgress({ stage: 'syncing', progress: 10, message: 'Sincronizando...' });
    const isSynced = await syncWithBootloader(reader, writer, onDebug);

    if (!isSynced) {
      throw new Error('Fallo de sincronización. No se detectó el bootloader tras el Auto-Reset.');
    }

    // 4. INICIAR PROGRAMACIÓN
    log('Entrando en modo programación...');
    await writer.write(new Uint8Array([STK_ENTER_PROGMODE, CRC_EOP]));
    await readWithTimeout(reader, 200, onDebug);

    onProgress({ stage: 'uploading', progress: 20, message: 'Subiendo...' });

    const pageSize = 128; // Tamaño típico página ATmega328p
    const totalPages = Math.ceil(hexData.length / pageSize);

    for (let page = 0; page < totalPages; page++) {
      const addr = page * pageSize;
      const pageData = hexData.slice(addr, addr + pageSize);
      
      // Preparar buffer de página
      const paddedData = new Uint8Array(pageSize);
      paddedData.fill(0xFF); // Rellenar espacio vacío
      paddedData.set(pageData);

      // Cargar Dirección
      const wordAddr = addr >> 1; // STK500 usa direcciones de palabras (bytes / 2)
      const addrCmd = new Uint8Array([STK_LOAD_ADDRESS, wordAddr & 0xFF, (wordAddr >> 8) & 0xFF, CRC_EOP]);
      await writer.write(addrCmd);
      await readWithTimeout(reader, 50);

      // Escribir Página
      const progCmd = new Uint8Array([STK_PROG_PAGE, 0x00, pageSize, 0x46]); // 0x46 = 'F' flash
      const packet = new Uint8Array(progCmd.length + pageSize + 1);
      packet.set(progCmd, 0);
      packet.set(paddedData, progCmd.length);
      packet[packet.length - 1] = CRC_EOP;

      await writer.write(packet);
      // Timeout calculado: escribir flash toma tiempo (~3-4ms por página real, damos 300ms seguridad)
      await readWithTimeout(reader, 300);

      const percent = Math.round(((page + 1) / totalPages) * 100);
      onProgress({ 
        stage: 'uploading', 
        progress: 20 + (percent * 0.7), 
        message: `Subiendo ${percent}%` 
      });
    }

    // 5. FINALIZAR
    onProgress({ stage: 'verifying', progress: 95, message: 'Finalizando...' });
    await writer.write(new Uint8Array([STK_LEAVE_PROGMODE, CRC_EOP]));
    await readWithTimeout(reader, 200);

    onProgress({ stage: 'done', progress: 100, message: '¡Subida exitosa!' });
    log('✓ FIN.');

  } catch (e) {
    log(`Error fatal: ${e}`);
    onProgress({ stage: 'error', progress: 0, message: (e as Error).message });
    throw e;
  } finally {
    // 6. LIMPIEZA
    // Es vital liberar los locks y cerrar para poder reintentar luego sin recargar la página
    if (reader) {
        try { await reader.cancel(); } catch {}
        reader.releaseLock();
    }
    if (writer) {
        try { await writer.close(); } catch {}
        writer.releaseLock();
    }
    try { await port.close(); } catch {}
  }
};