import {interpolateHclLong} from 'd3-interpolate';

export const interpolateColor = interpolateHclLong(
	'rgb(189,113,189)', // brighter purple
	'rgb(255,209,124)' // brighter orange
);
