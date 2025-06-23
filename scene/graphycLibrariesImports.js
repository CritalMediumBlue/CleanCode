import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Chart, registerables } from 'chart.js';

// Register all components needed for Chart.js
Chart.register(...registerables);

export {THREE, OrbitControls, Chart};