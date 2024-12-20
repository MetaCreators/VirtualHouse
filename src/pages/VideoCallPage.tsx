/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";

const VideoCallPage: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [rtpCapabilities, setRtpCapabilities] =
    useState<mediasoupClient.types.RtpCapabilities | null>(null);

  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const producerTransportRef = useRef<mediasoupClient.types.Transport | null>(
    null
  );
  const consumerTransportRef = useRef<mediasoupClient.types.Transport | null>(
    null
  );
  const producerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const consumerRef = useRef<mediasoupClient.types.Consumer | null>(null);
  const [params, setParams] = useState({
    encodings: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: {
      videoGoogleStartBitrate: 1000,
    },
  });
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const socket = io("http://localhost:8080");
  console.log("reached here");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Client connected, socket ID: " + socket.id);
    });

    socket.on("connection-success", ({ socketId }: any) => {
      console.log("Received socket ID: " + socketId);
    });

    socket.on("connect_error", (err: any) => {
      console.error("Connection error details:", err);
      console.error("Error stack:", err.stack);
    });

    socket.on("error", (err: any) => {
      console.error("Socket error:", err);
    });

    socket.on("hello", (msg: any) => {
      console.log(msg);
    });
    socket.on("new-user", (msg: any) => {
      console.log(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  console.log("reached here1");

  // let params: any = {
  //   encodings: [
  //     { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
  //     { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
  //     { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
  //   ],
  //   codecOptions: {
  //     videoGoogleStartBitrate: 1000,
  //   },
  // };

  const streamSuccess = async (stream: MediaStream) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    const track = stream.getVideoTracks()[0];
    // params = {
    //   track,
    //   ...params,
    // };
    setParams((prev) => ({
      ...prev, // Preserve existing properties
      track, // Add or overwrite the `track` property
    }));
  };

  const getLocalStream = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          width: { min: 640, max: 1920 },
          height: { min: 400, max: 1080 },
        },
      })
      .then(streamSuccess)
      .catch((error) => console.log(error.message));
  };

  const createDevice = async () => {
    try {
      const device = new mediasoupClient.Device();
      deviceRef.current = device;
      if (rtpCapabilities) {
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        console.log("RTP Capabilities", device.rtpCapabilities);
      } else {
        console.warn("RTP Capabilities not set");
      }
    } catch (error) {
      console.error(error);
      if ((error as any).name === "UnsupportedError") {
        console.warn("Browser not supported");
      }
    }
  };

  const getRtpCapabilities = async () => {
    await socket.emit("getRtpCapabilities", (data: any) => {
      console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);
      setRtpCapabilities(data.rtpCapabilities);
    });
  };

  const createSendTransport = async () => {
    await socket.emit(
      "createWebRtcTransport",
      { sender: true },
      ({ params }: any) => {
        if (params.error) {
          console.log(params.error);
          return;
        }

        console.log(params);

        if (deviceRef.current) {
          producerTransportRef.current =
            deviceRef.current.createSendTransport(params);
        } else {
          console.warn("Device is not initialized.");
          return;
        }

        console.log("reached here 1");
        producerTransportRef.current?.on(
          "connect",
          async ({ dtlsParameters }: any, callback: any, errback: any) => {
            try {
              await socket.emit("transport-connect", {
                //transportId: producerTransportRef.current?.id,
                dtlsParameters: dtlsParameters,
              });

              callback();
            } catch (error) {
              errback(error);
            }
          }
        );
        console.log("reached here 2");

        producerTransportRef.current?.on(
          "produce",
          async (parameters: any, callback: any, errback: any) => {
            console.log("Produce parameters received:", parameters);
            try {
              socket.emit(
                "transport-produce",
                {
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  appData: parameters.appData,
                },
                (response: any) => {
                  if (response.error) {
                    throw new Error(response.error);
                  }
                  callback({ id: response.id });
                }
              );
            } catch (error) {
              console.error("Error in transport-produce:", error);
              errback(error);
            }
          }
        );
        console.log("reached here 3");
      }
    );
  };

  const connectSendTransport = async () => {
    try {
      if (producerTransportRef.current) {
        try {
          producerRef.current = await producerTransportRef.current?.produce(
            params
          );
        } catch (error: any) {
          console.log("error here:", error);
        }
      } else {
        console.warn("Device is not initialized.(send transport error)");
        return;
      }

      producerRef.current?.on("trackended", () => {
        console.log("track ended");
      });
      producerRef.current?.on("transportclose", () => {
        console.log("transport ended");
      });
    } catch (error: any) {
      console.dir("error from connectSendTransport: ", error);
    }
  };

  const createRecvTransport = async () => {
    await socket.emit(
      "createWebRtcTransport",
      { sender: false },
      ({ params }: any) => {
        if (params.error) {
          console.log(params.error);
          return;
        }
        console.log(params);

        if (deviceRef.current) {
          consumerTransportRef.current =
            deviceRef.current?.createRecvTransport(params);
        } else {
          console.warn(
            "Device is not initialized.(createWebRtcTransport error)"
          );
          return;
        }

        consumerTransportRef.current?.on(
          "connect",
          async ({ dtlsParameters }: any, callback: any, errback: any) => {
            try {
              await socket.emit("transport-recv-connect", {
                //transportId: consumerTransportRef.current?.id,
                dtlsParameters: dtlsParameters,
              });

              callback();
            } catch (error) {
              errback(error);
            }
          }
        );
      }
    );
  };

  const connectRecvTransport = async () => {
    await socket.emit(
      "consume",
      {
        rtpCapabilities: deviceRef.current?.rtpCapabilities,
      },
      async ({ params }: any) => {
        if (params.error) {
          console.error("Cannot Consume");
          return;
        }
        console.log(params);

        if (consumerTransportRef.current) {
          consumerRef.current = await consumerTransportRef.current?.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters,
          });

          const { track } = consumerRef.current;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = new MediaStream([track]);
          }
          socket.emit("consumer-resume");
        } else {
          console.warn("Device is not initialized.(consume error)");
          return;
        }
      }
    );
  };

  return (
    <div>
      <Button onClick={getLocalStream}>start your video</Button>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black">
          <video ref={localVideoRef} autoPlay className="w-96"></video>{" "}
        </div>
        <div className="bg-black">
          <video ref={remoteVideoRef} autoPlay className="w-96"></video>{" "}
        </div>
      </div>
      <Button
        onClick={getRtpCapabilities}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get RTP Capabilities
      </Button>

      <Button
        onClick={createDevice}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Device
      </Button>

      <Button
        onClick={createSendTransport}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Send Transport
      </Button>

      <Button
        onClick={connectSendTransport}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Connect Send Transport & Produce
      </Button>
      <button
        onClick={createRecvTransport}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Recv Transport
      </button>

      <Button
        onClick={connectRecvTransport}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Connect Recv Transport & Consume
      </Button>
    </div>
  );
};

export default VideoCallPage;
