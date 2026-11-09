// Hard disks in a box: thin wrapper over the shared event-driven engine
// (applets/_kinetic/disks.js). Kept so the Maxwell applet and its tests keep
// their phase-1 API.
export {
  DISTRIBUTIONS, create, placeDisks, setVelocity, kineticTemperature, kineticEnergy, momentum,
  collisionsPerParticle, pairCollisionTime, wallCollisionTime, collide, step, minDistance, speeds,
  maxwell2D, maxwellBinCounts, vmaxFor,
} from '../_kinetic/disks.js';
