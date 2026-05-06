// bleState.svelte.ts
import { createContext } from "svelte";

const SERVICE_UUID = 'c0990295-2b98-4df2-9338-6caf6bd6acce';
const CHARACTERISTIC_UUID = '7bf3223d-0687-479f-80b0-5b4a4c6df558';

interface ConsolePayload {
  x:number,
  y: number,
  roll:number,
  buttonMask:number
}

interface BluetoothState {
  readonly isConnected: boolean;
  readonly isSupported: boolean;
  readonly receivedData: ConsolePayload | null;
  readonly error: Error | null;
  readonly deviceName: string | null;
  connect(): Promise<void>;
  disconnect(): void;
}

function createBluetoothState(): BluetoothState {
  let isConnected = $state(false);
  let deviceName = $state<string | null>(null);
  let allowDisconnection = $state(false);
  let isSupported = !(typeof navigator === 'undefined' || !navigator.bluetooth);
  let receivedData = $state<ConsolePayload | null>(null);
  let error = $state<Error | null>(null);

  let device: BluetoothDevice | null = null;
  let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async function connect(): Promise<void> {
    if (!isSupported) {
      error = new Error('Web Bluetooth is not supported in this browser.');
      throw error;
    }

    try {
      error = null;

      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }]
      });
      deviceName = device.name ?? null;
      device.addEventListener('gattserverdisconnected', handleDisconnect);

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleNotifications);

      isConnected = true;
    } catch (err) {
      throw err;
    }
  }

  function handleNotifications(event: Event): void {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
    if (!receivedData) { // Create object if data was null
      receivedData = {
        x: value.getInt32(0, true),
        y: value.getInt32(1*4, true),
        roll: value.getInt32(2*4, true)/100,
        buttonMask: value.getUint8(3*4),
      }
    } else {
      receivedData.x = value.getInt32(0, true);
      receivedData.y = value.getInt32(1*4, true);
      receivedData.roll = value.getInt32(2*4, true)/100;
      receivedData.buttonMask = value.getUint8(3*4);
    }
  }

  function disconnect(): void {
    if (device && device.gatt?.connected) {
      allowDisconnection = true;
      device.gatt.disconnect();
    }
  }

  function handleDisconnect(): void {
    device = null;
    characteristic = null;
    isConnected = false;
    receivedData = null;
    deviceName = null;
    if (!allowDisconnection) {
      error = new Error('Device lost.');
    }
  }

  return {
    get isConnected() { return isConnected; },
    get receivedData() { return receivedData; },
    get deviceName() { return deviceName; },
    get error() { return error; },
    connect,
    disconnect,
    isSupported,
  };
}

export const [getBluetoothContext, setBluetoothContext] = createContext<BluetoothState>();
export const bluetoothState = createBluetoothState();