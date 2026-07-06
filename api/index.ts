import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import app from '../backend/src/app';

export default app;
