// WebSerial type declarations
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

export const ARDUINO_BOARDS: ArduinoBoard[] = [
  { 
    name: 'Arduino Uno', 
    fqbn: 'arduino:avr:uno',
    uploadProtocol: 'stk500v1',
    baudRate: 115200 
  },
  { 
    name: 'Arduino Nano', 
    fqbn: 'arduino:avr:nano',
    uploadProtocol: 'stk500v1',
    baudRate: 57600 
  },
  { 
    name: 'Arduino Nano (Old Bootloader)', 
    fqbn: 'arduino:avr:nano:cpu=atmega328old',
    uploadProtocol: 'stk500v1',
    baudRate: 57600 
  },
  { 
    name: 'Arduino Mega 2560', 
    fqbn: 'arduino:avr:mega',
    uploadProtocol: 'stk500v2',
    baudRate: 115200 
  }
];

export const isWebSerialSupported = (): boolean => {
  return 'serial' in navigator;
};

export const requestSerialPort = async (): Promise<SerialPort | null> => {
  if (!isWebSerialSupported()) {
    throw new Error('WebSerial is not supported in this browser');
  }

  try {
    const port = await navigator.serial.requestPort();
    return port;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      // User cancelled the dialog
      return null;
    }
    throw error;
  }
};

export const openSerialConnection = async (
  port: SerialPort, 
  baudRate: number = 9600
): Promise<SerialConnection> => {
  await port.open({ baudRate });
  
  const writer = port.writable?.getWriter() ?? null;
  const reader = port.readable?.getReader() ?? null;

  return {
    port,
    reader,
    writer,
    isConnected: true
  };
};

export const closeSerialConnection = async (connection: SerialConnection): Promise<void> => {
  // Properly close reader first
  if (connection.reader) {
    try {
      await connection.reader.cancel();
      connection.reader.releaseLock();
    } catch (e) {
      console.warn('Error closing reader:', e);
    }
  }

  // Then close writer
  if (connection.writer) {
    try {
      await connection.writer.close();
      connection.writer.releaseLock();
    } catch (e) {
      console.warn('Error closing writer:', e);
    }
  }

  // Finally close port
  try {
    await connection.port.close();
  } catch (e) {
    console.warn('Error closing port:', e);
  }
};

export const writeToSerial = async (
  connection: SerialConnection, 
  data: string
): Promise<void> => {
  if (!connection.writer) {
    throw new Error('No writer available');
  }

  const encoder = new TextEncoder();
  await connection.writer.write(encoder.encode(data));
};

export const readFromSerial = async (
  connection: SerialConnection
): Promise<string | null> => {
  if (!connection.reader) {
    throw new Error('No reader available');
  }

  try {
    const { value, done } = await connection.reader.read();
    if (done) {
      return null;
    }
    const decoder = new TextDecoder();
    return decoder.decode(value);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NetworkError') {
      // Connection lost
      return null;
    }
    throw error;
  }
};

// STK500v1 protocol constants for Arduino upload
const STK_OK = 0x10;
const STK_INSYNC = 0x14;
const STK_GET_SYNC = 0x30;
const STK_LOAD_ADDRESS = 0x55;
const STK_PROG_PAGE = 0x64;
const STK_LEAVE_PROGMODE = 0x51;
const CRC_EOP = 0x20;

export interface UploadProgress {
  stage: 'connecting' | 'syncing' | 'uploading' | 'verifying' | 'done' | 'error';
  progress: number;
  message: string;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

// Simple hex file parser
export const parseHexFile = (hexContent: string): Uint8Array => {
  const lines = hexContent.split('\n').filter(line => line.startsWith(':'));
  const data: number[] = [];
  
  for (const line of lines) {
    const byteCount = parseInt(line.substring(1, 3), 16);
    const recordType = parseInt(line.substring(7, 9), 16);
    
    // Only process data records (type 00)
    if (recordType === 0x00) {
      for (let i = 0; i < byteCount; i++) {
        data.push(parseInt(line.substring(9 + i * 2, 11 + i * 2), 16));
      }
    }
  }
  
  return new Uint8Array(data);
};

// Upload hex to Arduino using STK500v1 protocol
export const uploadToArduino = async (
  port: SerialPort,
  hexData: Uint8Array,
  board: ArduinoBoard,
  onProgress: UploadProgressCallback
): Promise<void> => {
  const baudRate = board.baudRate;
  
  onProgress({ stage: 'connecting', progress: 0, message: 'Opening serial connection...' });
  
  // Reset Arduino by toggling DTR
  await port.open({ baudRate });
  await port.setSignals({ dataTerminalReady: false });
  await new Promise(resolve => setTimeout(resolve, 250));
  await port.setSignals({ dataTerminalReady: true });
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const writer = port.writable?.getWriter();
  const reader = port.readable?.getReader();
  
  if (!writer || !reader) {
    throw new Error('Could not get reader/writer');
  }
  
  try {
    onProgress({ stage: 'syncing', progress: 10, message: 'Syncing with bootloader...' });
    
    // Try to sync with bootloader
    let synced = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      await writer.write(new Uint8Array([STK_GET_SYNC, CRC_EOP]));
      await new Promise(resolve => setTimeout(resolve, 50));
      
      try {
        const { value } = await reader.read();
        if (value && value.length >= 2 && value[0] === STK_INSYNC && value[1] === STK_OK) {
          synced = true;
          break;
        }
      } catch {
        // Continue trying
      }
    }
    
    if (!synced) {
      throw new Error('Could not sync with bootloader. Is the board in programming mode?');
    }
    
    onProgress({ stage: 'uploading', progress: 20, message: 'Uploading firmware...' });
    
    // Upload in pages (128 bytes for Uno/Nano, 256 for Mega)
    const pageSize = board.name.includes('Mega') ? 256 : 128;
    const totalPages = Math.ceil(hexData.length / pageSize);
    
    for (let page = 0; page < totalPages; page++) {
      const address = page * pageSize;
      const pageData = hexData.slice(address, address + pageSize);
      
      // Load address (word address for AVR)
      const wordAddress = address >> 1;
      await writer.write(new Uint8Array([
        STK_LOAD_ADDRESS,
        wordAddress & 0xFF,
        (wordAddress >> 8) & 0xFF,
        CRC_EOP
      ]));
      
      // Wait for response
      await reader.read();
      
      // Program page
      const header = new Uint8Array([
        STK_PROG_PAGE,
        (pageData.length >> 8) & 0xFF,
        pageData.length & 0xFF,
        0x46 // 'F' for flash
      ]);
      
      await writer.write(new Uint8Array([...header, ...pageData, CRC_EOP]));
      await reader.read();
      
      const progress = 20 + ((page / totalPages) * 70);
      onProgress({ 
        stage: 'uploading', 
        progress, 
        message: `Uploading page ${page + 1}/${totalPages}...` 
      });
    }
    
    onProgress({ stage: 'verifying', progress: 95, message: 'Finishing upload...' });
    
    // Leave programming mode
    await writer.write(new Uint8Array([STK_LEAVE_PROGMODE, CRC_EOP]));
    await reader.read();
    
    onProgress({ stage: 'done', progress: 100, message: 'Upload complete!' });
    
  } finally {
    // Clean up
    try {
      await reader.cancel();
      reader.releaseLock();
    } catch { /* ignore */ }
    
    try {
      writer.releaseLock();
    } catch { /* ignore */ }
    
    try {
      await port.close();
    } catch { /* ignore */ }
  }
};
