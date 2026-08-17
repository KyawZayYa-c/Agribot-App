// lib/api/robotService.js
import { callESP, API_BASE_URL } from './client';

// ================= 1. DRIVE COMMANDS =================
export const moveForward = () => callESP('/f');
export const moveBackward = () => callESP('/b');
export const moveLeft = () => callESP('/l');
export const moveRight = () => callESP('/r');
export const stopRobot = () => callESP('/s');

// Drive Speed (0 - 255)
export const setDriveSpeed = (speed) => callESP(`/api?ds=${speed}`);


// ================= 2. PUMP CONTROL =================
// status: 1 (ON) သို့မဟုတ် 0 (OFF)
export const setPumpState = (status) => callESP(`/api?pump=${status}`);


// ================= 3. GEAR MOTOR =================
// status: 1 (ON) သို့မဟုတ် 0 (OFF)
export const setGearState = (status) => callESP(`/api?gear=${status}`);

// Gear Speed (0 - 255)
export const setGearSpeed = (speed) => callESP(`/api?gs=${speed}`);


// ================= 4. SERVO MOTORS =================
// Pan (0 - 180)
export const setPanAngle = (angle) => callESP(`/api?pan=${angle}`);

// Tilt (45 - 135)
export const setTiltAngle = (angle) => callESP(`/api?tilt=${angle}`);

// Rake (0 - 90)
export const setRakeAngle = (angle) => callESP(`/api?rake=${angle}`);


export const checkRobotConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000) 
    });
    return response.ok; 
  } catch (error) {
    console.log('Robot is offline or not connected');
    return false; 
  }
};