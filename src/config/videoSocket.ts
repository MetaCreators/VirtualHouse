/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/videoSocket.ts
import  io, {Socket } from 'socket.io-client';
import { types as mediasoupTypes, } from 'mediasoup-client';
import { RtpCapabilities, TransportParams } from '@/types/video';

const SOCKET_URL = 'http://localhost:8080';

export const setupVideoSocket = () => {
  const socket: typeof Socket = io(SOCKET_URL, { path: '/video' });

  return {
    socket,
    getRouterCapabilities: (callback: (caps: RtpCapabilities) => void) => {
      socket.emit('getRouterRtpCapabilities', null, callback);
    },
    createProducerTransport: (callback: (params: TransportParams) => void) => {
      socket.emit('createProducerTransport', null, callback);
    },
    createConsumerTransport: (callback: (params: TransportParams) => void) => {
      socket.emit('createConsumerTransport', null, callback);
    },
    connectProducerTransport: (dtlsParameters: mediasoupTypes.DtlsParameters, callback: () => void) => {
      socket.emit('connectProducerTransport', { dtlsParameters }, callback);
    },
    connectConsumerTransport: (dtlsParameters: mediasoupTypes.DtlsParameters, callback: () => void) => {
      socket.emit('connectConsumerTransport', { dtlsParameters }, callback);
    },
    // produce: (kind: mediasoupTypes.MediaKind, rtpParameters: mediasoupTypes.RtpParameters, callback: (id: { id: string }) => void) => {
    //   socket.emit('produce', { kind, rtpParameters }, callback);
    // },
    // consume: (rtpCapabilities: mediasoupTypes.RtpCapabilities, callback: (consumerParams: any) => void) => {
    //   socket.emit('consume', { rtpCapabilities }, callback);
    // },
    resume: (callback: () => void) => {
      socket.emit('resume', null, callback);
      },
    produce: (
      kind: mediasoupTypes.MediaKind, 
      rtpParameters: mediasoupTypes.RtpParameters, 
      callback: (id: { id: string }) => void
    ) => {
      return new Promise((resolve, reject) => {
        socket.emit('produce', { kind, rtpParameters }, (response:any) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
            callback(response);
          }
        });
      });
    },
    consume: (
      rtpCapabilities: mediasoupTypes.RtpCapabilities, 
      callback: (consumerParams: any) => void
    ) => {
      return new Promise((resolve, reject) => {
        socket.emit('consume', { rtpCapabilities }, (response:any) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
            callback(response);
          }
        });
      });
    },
  };
};