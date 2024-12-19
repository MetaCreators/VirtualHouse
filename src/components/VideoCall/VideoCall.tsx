/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { types as mediasoupTypes, Device } from "mediasoup-client";
import { setupVideoSocket } from "@/config/videoSocket";
import { RtpCapabilities, TransportParams } from "@/types/video";

const VideoCall: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const videoSocket = setupVideoSocket();
  const deviceRef = useRef<Device | null>(null);
  const producerTransportRef = useRef<mediasoupTypes.Transport | null>(null);
  const consumerTransportRef = useRef<mediasoupTypes.Transport | null>(null);
  const producerRef = useRef<mediasoupTypes.Producer | null>(null);
  const consumerRef = useRef<mediasoupTypes.Consumer | null>(null);

  useEffect(() => {
    setupConnection();

    // Listen for new producers
    videoSocket.socket.on("newProducer", () => {
      console.log("New producer available");
      consumeMedia();
    });

    return () => {
      // Cleanup
      localStream?.getTracks().forEach((track) => track.stop());
      videoSocket.socket.off("newProducer");

      // Close transports and producers/consumers
      producerTransportRef.current?.close();
      consumerTransportRef.current?.close();
      producerRef.current?.close();
      consumerRef.current?.close();
    };
  }, []);

  const setupConnection = async () => {
    try {
      await getLocalStream();
      await setupMediasoupDevice();
      await createProducerTransport();
      await produceMedia();
      await createConsumerTransport();
      setIsConnected(true);
    } catch (error) {
      console.error("Connection setup error:", error);
      setIsConnected(false);
    }
  };

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error getting local stream:", error);
    }
  };

  const setupMediasoupDevice = async () => {
    deviceRef.current = new Device();
    return new Promise<void>((resolve, reject) => {
      videoSocket.getRouterCapabilities(
        (routerRtpCapabilities: RtpCapabilities) => {
          try {
            if (deviceRef.current) {
              deviceRef.current.load({ routerRtpCapabilities });
              resolve();
            } else {
              reject(new Error("Device not initialized"));
            }
          } catch (error) {
            console.error("Error loading device:", error);
            reject(error);
          }
        }
      );
    });
  };

  const createProducerTransport = async () => {
    return new Promise<void>((resolve, reject) => {
      videoSocket.createProducerTransport((params: TransportParams) => {
        try {
          if (!deviceRef.current) throw new Error("Device not initialized");

          producerTransportRef.current =
            deviceRef.current.createSendTransport(params);

          producerTransportRef.current.on(
            "connect",
            async ({ dtlsParameters }, callback) => {
              try {
                await videoSocket.connectProducerTransport(
                  dtlsParameters,
                  callback
                );
              } catch (error) {
                console.error("Producer transport connect error:", error);
              }
            }
          );

          producerTransportRef.current.on(
            "produce",
            async ({ kind, rtpParameters }, callback) => {
              try {
                const result = await videoSocket.produce(
                  kind,
                  rtpParameters,
                  callback
                );
                // Notify other clients about new producer
                videoSocket.socket.emit("newProducer");
                return result;
              } catch (error) {
                console.error("Produce error:", error);
              }
            }
          );

          resolve();
        } catch (error) {
          console.error("Create producer transport error:", error);
          reject(error);
        }
      });
    });
  };

  const produceMedia = async () => {
    try {
      if (!producerTransportRef.current || !localStream) return;

      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];

      if (audioTrack) {
        producerRef.current = await producerTransportRef.current.produce({
          track: audioTrack,
          // Removed audioGain as it's not a valid option
        });
      }
      if (videoTrack) {
        producerRef.current = await producerTransportRef.current.produce({
          track: videoTrack,
          encodings: [
            { maxBitrate: 1000000 },
            { maxBitrate: 500000 },
            { maxBitrate: 100000 },
          ],
        });
      }
    } catch (error) {
      console.error("Produce media error:", error);
    }
  };

  const createConsumerTransport = async () => {
    return new Promise<void>((resolve, reject) => {
      videoSocket.createConsumerTransport((params: TransportParams) => {
        try {
          if (!deviceRef.current) throw new Error("Device not initialized");

          consumerTransportRef.current =
            deviceRef.current.createRecvTransport(params);

          consumerTransportRef.current.on(
            "connect",
            async ({ dtlsParameters }, callback) => {
              try {
                await videoSocket.connectConsumerTransport(
                  dtlsParameters,
                  callback
                );
              } catch (error) {
                console.error("Consumer transport connect error:", error);
              }
            }
          );

          resolve();
        } catch (error) {
          console.error("Create consumer transport error:", error);
          reject(error);
        }
      });
    });
  };

  const consumeMedia = async () => {
    try {
      if (!deviceRef.current || !consumerTransportRef.current) {
        throw new Error("Transport or device not initialized");
      }

      const consumerParams = await new Promise<any>((resolve, reject) => {
        if (!deviceRef.current) {
          throw new Error("Device not initialized");
        }
        videoSocket.consume(deviceRef.current.rtpCapabilities, (params) => {
          if (params.error) {
            reject(new Error(params.error));
          } else {
            resolve(params);
          }
        });
      });

      // Consume the media track
      consumerRef.current = await consumerTransportRef.current.consume({
        id: consumerParams.id,
        producerId: consumerParams.producerId,
        kind: consumerParams.kind,
        rtpParameters: consumerParams.rtpParameters,
        appData: consumerParams.appData,
      });

      // Update remote video source
      if (remoteVideoRef.current) {
        const newRemoteStream = new MediaStream([consumerRef.current.track]);
        remoteVideoRef.current.srcObject = newRemoteStream;
      }

      // Resume consumer if paused
      if (consumerRef.current.paused) {
        await consumerRef.current.resume();
      }
    } catch (error) {
      console.error("Consume media error:", error);
    }
  };

  return (
    <div className="video-container flex space-x-4 p-4">
      <div className="local-video-container">
        <h2 className="text-lg font-semibold mb-2">Local Video</h2>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-96 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="remote-video-container">
        <h2 className="text-lg font-semibold mb-2">Remote Video</h2>
        {isConnected ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-96 border border-gray-300 rounded-lg"
          />
        ) : (
          <div className="w-96 h-64 border border-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Connecting...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
