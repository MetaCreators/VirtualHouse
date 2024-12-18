// src/types/video.ts
import { types as mediasoupTypes } from 'mediasoup-client';

export interface RtpCapabilities {
  codecs: mediasoupTypes.RtpCodecCapability[];
  headerExtensions: mediasoupTypes.RtpHeaderExtension[];
}

export interface TransportParams {
  id: string;
  iceParameters: mediasoupTypes.IceParameters;
  iceCandidates: mediasoupTypes.IceCandidate[];
  dtlsParameters: mediasoupTypes.DtlsParameters;
}